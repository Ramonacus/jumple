import Phaser from 'phaser';
import { PlayerState } from './PlayerState';
import { Player } from '../Player';

/**
 * WallJumpState: Player performs a wall jump
 *
 * Entry: From FallingState or JumpingState when jump input + opposite direction detected while on wall
 * Requirements: Must press opposite direction key (away from wall) + jump
 * Behavior: Applies 45-degree impulse away from wall and transitions to jumping
 *
 * Transitions:
 * - → JumpingState: After applying wall jump impulse
 */
export class WallJumpState implements PlayerState {
  enter(player: Player): void {
    const isOnLeftWall = player.body.blocked.left;

    // Calculate direction away from wall
    const directionX = isOnLeftWall ? 1 : -1;
    const jumpMagnitude = Math.abs(player.jumpSpeed);
    player.setVelocityY(-jumpMagnitude);
    player.setVelocityX(jumpMagnitude * directionX * 0.5);

    player.play('jump-up', true);
    player.changeState(player.states.get('jumping'));
  }

  update(
    _player: Player,
    _cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ): void {
    return;
  }

  exit(_player: Player): void {
    return;
  }
}
