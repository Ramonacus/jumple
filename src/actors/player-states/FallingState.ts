import Phaser from 'phaser';
import { PlayerState } from './PlayerState';

/**
 * FallingState: Player is airborne moving downward
 *
 * Transitions:
 * - → LandingState: When touches ground
 * - → WallClingState: When SPACE pressed while touching wall
 * - → JumpingState: When jump pressed during coyote time
 */
export class FallingState implements PlayerState {
  enter(player: any): void {
    // Set up coyote time if we have it
    if (player.canCoyoteJump) {
      player.coyoteTimeTimeout = setTimeout(() => {
        player.canCoyoteJump = false;
      }, player.coyoteTime);
    }
  }

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

    // Handle air movement
    if (cursors.left.isDown) {
      player.setVelocityX(-player.airborneSpeed);
    } else if (cursors.right.isDown) {
      player.setVelocityX(player.airborneSpeed);
    } else {
      const newSpeedX = Math.abs(speedX) < 10 ? 0 : speedX * 0.95;
      player.setVelocityX(newSpeedX);
    }

    // Handle coyote jump
    if (cursors.up.isDown && player.canCoyoteJump) {
      player.changeState(player.states.get('jumping'));
      return;
    }

    // Handle jump buffering
    if (cursors.up.isDown && !player.isJumpBuffered) {
      player.isJumpBuffered = true;
      player.jumpBufferTimeout = setTimeout(() => {
        player.isJumpBuffered = false;
      }, player.jumpBufferTime);
    }
  }

  exit(player: any): void {
    // Clear coyote timeout
    if (player.coyoteTimeTimeout) {
      clearTimeout(player.coyoteTimeTimeout);
      player.coyoteTimeTimeout = undefined;
    }
  }
}
