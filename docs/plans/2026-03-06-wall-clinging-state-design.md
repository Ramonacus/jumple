# Wall Clinging State Design

**Date**: 2026-03-06
**Author**: Ramon Ferrer
**Status**: Approved

## Overview

Extract wall clinging mechanics from `Player.ts` into a dedicated `WallClingState` to integrate properly with the state machine pattern. Currently, wall clinging logic exists but is disconnected from the state machine.

## Requirements

- Player presses SPACE while airborne and touching a wall to grab
- Player stays frozen in place (velocity Y = 0) while clinging
- Player can wall jump by pressing UP + opposite direction
- Player releases by letting go of SPACE
- Player can grab walls from both FallingState and JumpingState

## Architecture

### File Structure

**New file**: `src/actors/player-states/WallClingState.ts`
- Implements `PlayerState` interface
- Contains all wall clinging logic

**Modified files**:
- `src/actors/player-states/FallingState.ts` - add wall cling transition
- `src/actors/player-states/JumpingState.ts` - add wall cling transition
- `src/actors/player-states/index.ts` - export WallClingState
- `src/actors/Player.ts` - remove deprecated wall methods and properties

### State Registration

In `Player.ts` constructor:
```typescript
this.states.set('wall-cling', new WallClingState());
```

## State Transitions

### Entering WallClingState

From `FallingState.update()` and `JumpingState.update()`:
```typescript
if (cursors.space.isDown && player.body.onWall()) {
  player.changeState(player.states.get('wall-cling'));
  return;
}
```

Check must happen each frame before other input handling.

### Exiting WallClingState

Priority order:
1. **To LandingState**: `player.body.onFloor()` - touched ground
2. **To JumpingState**: Wall jump input detected
3. **To FallingState**: `!cursors.space.isDown` - released SPACE

Wall jump detection:
```typescript
cursors.up.isDown &&
((wallDirection === 'left' && cursors.right.isDown) ||
 (wallDirection === 'right' && cursors.left.isDown))
```

## WallClingState Implementation

### enter(player)

- Store wall direction: `player.wallDirection = player.body.blocked.left ? 'left' : 'right'`
- Freeze physics: `player.body.moves = false`
- Stop vertical movement: `player.setVelocityY(0)`
- Play animation: `player.play('jump-down', true)`

### update(player, cursors)

Check exit conditions in order:

1. **Ground check**:
   ```typescript
   if (player.body.onFloor()) {
     player.changeState(player.states.get('landing'));
     return;
   }
   ```

2. **Wall jump check**:
   ```typescript
   if (cursors.up.isDown &&
       ((player.wallDirection === 'left' && cursors.right.isDown) ||
        (player.wallDirection === 'right' && cursors.left.isDown))) {
     const direction = player.body.blocked.left ? -1 : 1;
     player.setVelocityY(player.jumpSpeed);  // -450
     player.setVelocityX(player.jumpSpeed * direction);  // ±450
     player.body.moves = true;
     player.changeState(player.states.get('jumping'));
     return;
   }
   ```

3. **Release check**:
   ```typescript
   if (!cursors.space.isDown) {
     player.changeState(player.states.get('falling'));
     return;
   }
   ```

### exit(player)

- Re-enable physics: `player.body.moves = true`
- Clear wall direction: `player.wallDirection = null`

## Player.ts Cleanup

### Properties to Keep
- `wallDirection: 'left' | 'right' | null = null` - needed for wall jump direction

### Properties to Remove
- `isInWall` - state machine handles this now
- `inWallBuffer` - no longer needed
- `inWallBufferTime` - no longer needed

### Methods to Remove
- `updateOnWall()` - logic moved to WallClingState
- `grabWall()` - logic moved to WallClingState.enter()
- `leaveWall()` - logic moved to WallClingState.exit()

### Code to Remove
In `Player.update()` (lines 119-123):
```typescript
// Remove this entire block:
if (this.isInWall) {
  this.updateOnWall(cursors);
  return;
}
```

## Testing Considerations

Manual testing scenarios:
1. Press SPACE while falling against a wall → should stick
2. Press SPACE while jumping against a wall → should stick
3. Release SPACE while clinging → should fall
4. Press UP + opposite direction while clinging → should wall jump
5. Cling to wall and slide down to ground → should land
6. Try to cling without touching a wall → should not stick

## Benefits

- **Separation of concerns**: Wall logic contained in its own state
- **Consistency**: Follows established state machine pattern
- **Maintainability**: Easier to modify wall behavior independently
- **Testability**: State can be tested in isolation
- **Clarity**: State transitions are explicit and documented
