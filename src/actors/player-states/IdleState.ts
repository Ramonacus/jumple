import Phaser from 'phaser';
import { PlayerState } from './PlayerState';
import { Player } from '../Player';

/**
 * IdleState: Player is on ground with no horizontal input
 *
 * Transitions:
 * - → WalkingState: When left/right pressed
 * - → JumpingState: When jump pressed
 * - → FallingState: When no longer on floor
 */
export class IdleState implements PlayerState {
  enter(player: Player): void {
    player.speed = 0;
    player.setVelocityX(0);
    player.play('idle', true);
  }

  update(
    player: Player,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ): void {
    // Check if we fell off a ledge
    if (!player.body.onFloor()) {
      player.canCoyoteJump = true;
      player.changeState(player.states.get('falling'));
      return;
    }

    // Check for horizontal input → Walking
    if (cursors.left.isDown || cursors.right.isDown) {
      player.changeState(player.states.get('walking'));
      return;
    }

    // Check for jump input → Jumping
    if (cursors.up.isDown) {
      player.changeState(player.states.get('jumping'));
      return;
    }
  }

  exit(player: Player): void {
    // No cleanup needed
  }
}
