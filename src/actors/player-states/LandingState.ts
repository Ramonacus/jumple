import Phaser from 'phaser';
import { PlayerState } from './PlayerState';
import { Player } from '../Player';

/**
 * LandingState: Player just touched ground (brief transition)
 *
 * Transitions:
 * - → JumpingState: If jump was buffered
 * - → WalkingState: If there's horizontal input
 * - → IdleState: If no input
 */
export class LandingState implements PlayerState {
  enter(player: Player): void {
    // Reset airborne flags
    player.isJumping = false;
    player.canCoyoteJump = false;

    // Clear coyote timeout if still active
    if (player.coyoteTimeTimeout) {
      clearTimeout(player.coyoteTimeTimeout);
      player.coyoteTimeTimeout = undefined;
    }
  }

  update(
    player: Player,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ): void {
    // Check for buffered jump
    if (player.isJumpBuffered) {
      player.clearJumpBuffer();
      player.changeState(player.states.get('jumping'));
      return;
    }

    // Check for horizontal input → Walking
    if (cursors.left.isDown || cursors.right.isDown) {
      player.changeState(player.states.get('walking'));
      return;
    }

    // No input → Idle
    player.changeState(player.states.get('idle'));
  }

  exit(player: Player): void {
    // No cleanup needed
  }
}
