import Phaser from 'phaser';
import { PlayerState } from './PlayerState';

/**
 * WalkingState: Player is on ground with horizontal input
 *
 * Transitions:
 * - → IdleState: When no input and speed reaches 0
 * - → JumpingState: When jump pressed
 * - → FallingState: When no longer on floor
 */
export class WalkingState implements PlayerState {
  enter(player: any): void {
    player.play('walk', true);
  }

  update(player: any, cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    // Check if we fell off a ledge
    if (!player.body.onFloor()) {
      player.canCoyoteJump = true;
      player.changeState(player.states.get('falling'));
      return;
    }

    // Check for jump input → Jumping
    if (cursors.up.isDown) {
      player.changeState(player.states.get('jumping'));
      return;
    }

    // Handle horizontal movement
    if (cursors.left.isDown) {
      player.lastDirection = -1;
      player.speed = Math.min(player.speed + player.acceleration, player.maxSpeed);
      player.setVelocityX(-player.speed);
      player.play('walk', true);
    } else if (cursors.right.isDown) {
      player.lastDirection = 1;
      player.speed = Math.min(player.speed + player.acceleration, player.maxSpeed);
      player.setVelocityX(player.speed);
      player.play('walk', true);
    } else if (player.speed > player.deceleration) {
      // Decelerate
      player.speed -= player.deceleration;
      player.setVelocityX(player.speed * player.lastDirection);
    } else {
      // Stopped → Idle
      player.changeState(player.states.get('idle'));
      return;
    }
  }

  exit(player: any): void {
    // No cleanup needed
  }
}
