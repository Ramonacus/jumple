# Wall Clinging State Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract wall clinging mechanics from Player.ts into a dedicated WallClingState following the state machine pattern.

**Architecture:** Create new WallClingState class implementing PlayerState interface, add transition checks to FallingState and JumpingState, remove deprecated wall methods from Player.ts.

**Tech Stack:** TypeScript, Phaser 3, existing state machine pattern

---

## Task 1: Create WallClingState Class

**Files:**
- Create: `src/actors/player-states/WallClingState.ts`

**Step 1: Create WallClingState file with complete implementation**

Create `src/actors/player-states/WallClingState.ts`:

```typescript
import Phaser from 'phaser';
import { PlayerState } from './PlayerState';

/**
 * WallClingState: Player is clinging to a wall
 *
 * Entry: From FallingState or JumpingState when SPACE pressed while touching wall
 * Behavior: Freezes player in place (velocity Y = 0)
 *
 * Transitions:
 * - → LandingState: When touches ground
 * - → JumpingState: When wall jump input (UP + opposite direction)
 * - → FallingState: When SPACE released
 */
export class WallClingState implements PlayerState {
  enter(player: any): void {
    // Store which wall we're clinging to
    player.wallDirection = player.body.blocked.left ? 'left' : 'right';

    // Freeze physics to prevent gravity
    player.body.moves = false;

    // Stop vertical movement
    player.setVelocityY(0);

    // Play clinging animation (reuse jump-down frame)
    player.play('jump-down', true);
  }

  update(player: any, cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    // Priority 1: Check if touched ground → Landing
    if (player.body.onFloor()) {
      player.changeState(player.states.get('landing'));
      return;
    }

    // Priority 2: Check for wall jump → Jumping
    if (
      cursors.up.isDown &&
      ((player.wallDirection === 'left' && cursors.right.isDown) ||
        (player.wallDirection === 'right' && cursors.left.isDown))
    ) {
      // Calculate jump direction (away from wall)
      const direction = player.body.blocked.left ? 1 : -1;

      // Re-enable physics before jumping
      player.body.moves = true;

      // Set wall jump velocities
      player.setVelocityY(player.jumpSpeed);  // -450
      player.setVelocityX(player.jumpSpeed * direction);  // ±450

      // Transition to jumping state
      player.changeState(player.states.get('jumping'));
      return;
    }

    // Priority 3: Check for SPACE release → Falling
    if (!cursors.space.isDown) {
      player.changeState(player.states.get('falling'));
      return;
    }

    // Otherwise, stay clinging (do nothing, frozen in place)
  }

  exit(player: any): void {
    // Re-enable physics
    player.body.moves = true;

    // Clear wall direction
    player.wallDirection = null;
  }
}
```

**Step 2: Verify file compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/actors/player-states/WallClingState.ts
git commit -m "feat: add WallClingState class

Implements wall clinging behavior as a proper state in the state machine.
Player can cling by pressing SPACE while touching wall, and can wall jump
or release to fall."
```

---

## Task 2: Register WallClingState in Player

**Files:**
- Modify: `src/actors/Player.ts:3-10` (imports)
- Modify: `src/actors/Player.ts:55-60` (state registration)

**Step 1: Add WallClingState import**

In `src/actors/Player.ts`, update the import at lines 3-10:

```typescript
import {
  PlayerState,
  IdleState,
  WalkingState,
  JumpingState,
  FallingState,
  LandingState,
  WallClingState,  // Add this
} from './player-states';
```

**Step 2: Register WallClingState in constructor**

In `src/actors/Player.ts`, add state registration after line 59:

```typescript
// Initialize state machine
this.states.set('idle', new IdleState());
this.states.set('walking', new WalkingState());
this.states.set('jumping', new JumpingState());
this.states.set('falling', new FallingState());
this.states.set('landing', new LandingState());
this.states.set('wall-cling', new WallClingState());  // Add this
```

**Step 3: Verify file compiles**

Run: `npm run build`
Expected: Error about WallClingState not exported from player-states/index

**Step 4: Export WallClingState from index**

In `src/actors/player-states/index.ts`, add export:

```typescript
export { PlayerState } from './PlayerState';
export { IdleState } from './IdleState';
export { WalkingState } from './WalkingState';
export { JumpingState } from './JumpingState';
export { FallingState } from './FallingState';
export { LandingState } from './LandingState';
export { WallClingState } from './WallClingState';  // Add this
```

**Step 5: Verify build succeeds**

Run: `npm run build`
Expected: Success, no errors

**Step 6: Commit**

```bash
git add src/actors/Player.ts src/actors/player-states/index.ts
git commit -m "feat: register WallClingState in Player

Add WallClingState to the state machine registry and export from
player-states module."
```

---

## Task 3: Add Wall Cling Transition to FallingState

**Files:**
- Modify: `src/actors/player-states/FallingState.ts:21-28`

**Step 1: Add wall cling check to FallingState.update()**

In `src/actors/player-states/FallingState.ts`, add check after line 28 (after ground check):

```typescript
update(player: any, cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
  const { x: speedX, y: speedY } = player.body.velocity;

  // Check if landed → Landing
  if (player.body.onFloor()) {
    player.changeState(player.states.get('landing'));
    return;
  }

  // Check for wall cling → WallCling
  if (cursors.space.isDown && player.body.onWall()) {
    player.changeState(player.states.get('wall-cling'));
    return;
  }

  // Update animation based on fall speed
  if (Math.abs(speedY) < 10) {
    player.play('jump-float', true);
  } else {
    player.play('jump-down', true);
  }

  // ... rest of update logic
}
```

**Step 2: Verify file compiles**

Run: `npm run build`
Expected: Success, no errors

**Step 3: Commit**

```bash
git add src/actors/player-states/FallingState.ts
git commit -m "feat: add wall cling transition to FallingState

Player can now grab walls while falling by pressing SPACE when
touching a wall."
```

---

## Task 4: Add Wall Cling Transition to JumpingState

**Files:**
- Modify: `src/actors/player-states/JumpingState.ts:18-25`

**Step 1: Add wall cling check to JumpingState.update()**

In `src/actors/player-states/JumpingState.ts`, add check after line 25 (after peak check):

```typescript
update(player: any, cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
  const { x: speedX, y: speedY } = player.body.velocity;

  // Check if reached peak → Falling
  if (speedY >= 0) {
    player.changeState(player.states.get('falling'));
    return;
  }

  // Check for wall cling → WallCling
  if (cursors.space.isDown && player.body.onWall()) {
    player.changeState(player.states.get('wall-cling'));
    return;
  }

  // Handle air movement
  if (cursors.left.isDown) {
    player.setVelocityX(-player.airborneSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(player.airborneSpeed);
  } else {
    const newSpeedX = Math.abs(speedX) < 10 ? 0 : speedX * 0.95;
    player.setVelocityX(newSpeedX);
  }
}
```

**Step 2: Verify file compiles**

Run: `npm run build`
Expected: Success, no errors

**Step 3: Commit**

```bash
git add src/actors/player-states/JumpingState.ts
git commit -m "feat: add wall cling transition to JumpingState

Player can now grab walls while jumping upward by pressing SPACE
when touching a wall."
```

---

## Task 5: Clean Up Player.ts - Remove Deprecated Wall Code

**Files:**
- Modify: `src/actors/Player.ts`

**Step 1: Remove deprecated properties**

In `src/actors/Player.ts`, remove these properties (around lines 30-32):

```typescript
// REMOVE these lines:
isInWall = false;
inWallBuffer: number | undefined;
inWallBufferTime = 200;
```

Keep `wallDirection` - it's still needed by WallClingState.

**Step 2: Remove wall override from Player.update()**

In `src/actors/Player.ts`, remove lines 119-123:

```typescript
// REMOVE this entire block:
// Wall climbing overrides state machine
if (this.isInWall) {
  this.updateOnWall(cursors);
  return;
}
```

The update() method should now just be:

```typescript
update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
  // Handle sprite flipping based on input
  if (cursors.left.isDown) {
    this.flipX = true;
  } else if (cursors.right.isDown) {
    this.flipX = false;
  }

  // Delegate to current state
  this.currentState.update(this, cursors);
}
```

**Step 3: Remove deprecated methods**

In `src/actors/Player.ts`, remove these three methods (around lines 130-169):

```typescript
// REMOVE updateOnWall() method
// REMOVE grabWall() method
// REMOVE leaveWall() method
```

**Step 4: Verify file compiles**

Run: `npm run build`
Expected: Success, no errors

**Step 5: Commit**

```bash
git add src/actors/Player.ts
git commit -m "refactor: remove deprecated wall clinging code

Remove isInWall, updateOnWall(), grabWall(), and leaveWall() as
wall clinging is now handled by WallClingState. Keep wallDirection
property as it's used by the state."
```

---

## Task 6: Manual Testing & Verification

**Step 1: Start development server**

Run: `npm run dev`

Open: http://localhost:5173/

**Step 2: Test wall cling entry from falling**

Manual test:
1. Walk off a ledge to enter FallingState
2. While falling against a wall, press SPACE
3. Expected: Player should stick to wall, frozen in place

**Step 3: Test wall cling entry from jumping**

Manual test:
1. Jump toward a wall (UP + direction)
2. While moving upward against wall, press SPACE
3. Expected: Player should stick to wall immediately

**Step 4: Test SPACE release exit**

Manual test:
1. Cling to wall (SPACE pressed)
2. Release SPACE
3. Expected: Player should fall immediately (enter FallingState)

**Step 5: Test wall jump**

Manual test:
1. Cling to wall on the left (hold SPACE)
2. Press UP + RIGHT simultaneously
3. Expected: Player should jump away from wall at 45-degree angle
4. Repeat for wall on the right (UP + LEFT)

**Step 6: Test landing while clinging**

Manual test:
1. Cling to wall high up
2. Somehow reach ground while clinging (if possible in level)
3. Expected: Should transition to LandingState, not stay frozen

**Step 7: Document test results**

If all tests pass, commit:

```bash
git commit --allow-empty -m "test: verify wall clinging state behavior

Manual testing confirms:
- Can cling from FallingState and JumpingState
- SPACE release exits to FallingState
- Wall jump works correctly
- Landing while clinging transitions properly"
```

---

## Summary

**Files Created:**
- `src/actors/player-states/WallClingState.ts` - New state class

**Files Modified:**
- `src/actors/Player.ts` - Register state, remove deprecated code
- `src/actors/player-states/FallingState.ts` - Add wall cling transition
- `src/actors/player-states/JumpingState.ts` - Add wall cling transition
- `src/actors/player-states/index.ts` - Export WallClingState

**Total Commits:** 6-7 commits following conventional commit format

**Testing Strategy:** Manual testing (no unit test infrastructure exists)

**Rollback Plan:** All changes are in discrete commits, can revert individually

---

## Known Limitations

- No automated tests (project lacks test infrastructure)
- Manual testing only verifies happy paths
- Edge cases (rapid state transitions, simultaneous inputs) untested
- Animation uses 'jump-down' frame, not dedicated wall cling sprite
