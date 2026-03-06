import Phaser from 'phaser';
import { PlayerState } from './PlayerState';

/**
 * JumpingState: Player initiated a jump, moving upward
 *
 * Transitions:
 * - → FallingState: When vertical velocity >= 0 (reached peak)
 * - → WallClingState: When SPACE pressed while touching wall
 */
export class JumpingState implements PlayerState {
  enter(player: any): void {
    player.isJumping = true;
    player.canCoyoteJump = false;
    player.setVelocityY(player.jumpSpeed);
    player.play('jump-up', true);
  }

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

  exit(player: any): void {
    // No cleanup needed
  }
}
