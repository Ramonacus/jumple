import Phaser, { Scene } from 'phaser';
import { PlayerEvents } from '../types/events';
import {
  PlayerState,
  IdleState,
  WalkingState,
  JumpingState,
  FallingState,
  LandingState,
} from './player-states';

class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  maxSpeed = 200;
  acceleration = 7.5;
  deceleration = 10;
  speed = 0;
  airborneSpeed = 200;
  jumpSpeed = -450;

  isJumping = false;
  canCoyoteJump = false;
  coyoteTime = 100;
  coyoteTimeTimeout: number | undefined;

  jumpBufferTime = 125;
  jumpBufferTimeout: number | undefined;
  isJumpBuffered = false;

  isInWall = false;
  inWallBuffer: number | undefined;
  inWallBufferTime = 200;
  wallDirection: 'left' | 'right' | null = null;

  lastDirection = 1;

  // State machine
  currentState!: PlayerState;
  states: Map<string, PlayerState> = new Map();

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(20, 22);
    this.body.setOffset(6, 6);
    this.setGravityY(400);

    this.setCollideWorldBounds(true);
    this.createAnimations(scene);

    // Initialize state machine
    this.states.set('idle', new IdleState());
    this.states.set('walking', new WalkingState());
    this.states.set('jumping', new JumpingState());
    this.states.set('falling', new FallingState());
    this.states.set('landing', new LandingState());

    // Start in idle state
    this.currentState = this.states.get('idle')!;
    this.currentState.enter(this);
  }

  changeState(newState: PlayerState): void {
    this.currentState?.exit(this);
    this.currentState = newState;
    this.currentState.enter(this);
  }

  createAnimations(scene: Scene) {
    scene.anims.create({
      key: 'walk',
      frames: scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: 'idle',
      frames: [
        { key: 'player', frame: 0, duration: 3000 },
        { key: 'player', frame: 1, duration: 700 },
        { key: 'player', frame: 2, duration: 200 },
        { key: 'player', frame: 3, duration: 700 },
      ],
      frameRate: 20,
      repeat: -1,
    });

    scene.anims.create({
      key: 'jump-up',
      frames: [{ key: 'player', frame: 9 }],
      frameRate: 1,
    });

    scene.anims.create({
      key: 'jump-float',
      frames: [{ key: 'player', frame: 10 }],
      frameRate: 1,
    });

    scene.anims.create({
      key: 'jump-down',
      frames: [{ key: 'player', frame: 11 }],
      frameRate: 1,
    });
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    // Handle sprite flipping based on input
    if (cursors.left.isDown) {
      this.flipX = true;
    } else if (cursors.right.isDown) {
      this.flipX = false;
    }

    // Wall climbing overrides state machine
    if (this.isInWall) {
      this.updateOnWall(cursors);
      return;
    }

    // Delegate to current state
    this.currentState.update(this, cursors);
  }


  private updateOnWall(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (
      cursors.up.isDown &&
      ((this.wallDirection === 'left' && cursors.right.isDown) ||
        (this.wallDirection === 'right' && cursors.left.isDown))
    ) {
      const direction = this.body.blocked.left ? -1 : 1;
      this.isJumping = true;
      this.setVelocityY(this.jumpSpeed);
      this.setVelocityX(this.jumpSpeed * direction);
      this.leaveWall();
      return;
    }

    if (
      (this.wallDirection === 'left' && cursors.left.isDown) ||
      (this.wallDirection === 'right' && cursors.right.isDown)
    ) {
      this.setVelocityY(0);
      return;
    }

    this.inWallBuffer = window.setTimeout(() => {
      this.leaveWall();
    }, this.inWallBufferTime);
  }

  private grabWall() {
    this.isInWall = true;
    this.wallDirection = this.body.blocked.left ? 'left' : 'right';
  }

  private leaveWall() {
    this.isInWall = false;
    this.wallDirection = null;
  }


  takeHit() {
    this.scene.events.emit(PlayerEvents.DEATH);
  }

  destroy(fromScene?: boolean): void {
    // Clean up timers
    if (this.coyoteTimeTimeout) {
      clearTimeout(this.coyoteTimeTimeout);
    }
    if (this.jumpBufferTimeout) {
      clearTimeout(this.jumpBufferTimeout);
    }

    // Exit current state
    this.currentState?.exit(this);

    super.destroy(fromScene);
  }
}

export { Player };
