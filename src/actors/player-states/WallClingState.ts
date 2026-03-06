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
    // Defensive check: ensure we have wall contact
    if (!player.body.blocked.left && !player.body.blocked.right) {
      console.warn('WallClingState entered without wall contact');
      player.changeState(player.states.get('falling'));
      return;
    }

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

    // Priority 2: Check if lost wall contact → Falling
    if (!player.body.blocked.left && !player.body.blocked.right) {
      player.changeState(player.states.get('falling'));
      return;
    }

    // Priority 3: Check for wall jump → Jumping
    if (
      cursors.up.isDown &&
      ((player.wallDirection === 'left' && cursors.right.isDown) ||
        (player.wallDirection === 'right' && cursors.left.isDown))
    ) {
      // Calculate jump direction (away from wall)
      const direction = player.wallDirection === 'left' ? 1 : -1;

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
