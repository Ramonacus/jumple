import Phaser from 'phaser';
import { PlayerState } from './PlayerState';
import { Player } from '../Player';

/**
 * JumpingState: Player initiated a jump, moving upward
 *
 * Transitions:
 * - → WallJumpState: When on wall + jump input + opposite direction key pressed (mid-air)
 * - → FallingState: When vertical velocity >= 0 (reached peak)
 */
export class JumpingState implements PlayerState {
  enter(player: Player): void {
    player.isJumping = true;
    player.canCoyoteJump = false;
    player.setVelocityY(player.jumpSpeed);
    player.play('jump-up', true);
  }

  update(
    player: Player,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ): void {
    const { x: speedX, y: speedY } = player.body.velocity;

    // Check for wall jump → WallJump (can wall jump while ascending)
    if (player.canPerformWallJump(cursors)) {
      player.changeState(player.states.get('wall-jump'));
      return;
    }

    // Check if reached peak → Falling
    if (speedY >= 0) {
      player.changeState(player.states.get('falling'));
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

  exit(player: Player): void {
    // No cleanup needed
  }
}
