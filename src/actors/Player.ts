import Phaser, { Scene } from 'phaser';

class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  maxSpeed = 200;
  acceleration = 7.5;
  deceleration = 10;
  speed = 0;
  airborneSpeed = 200;
  jumpSpeed = -520;

  isJumping = false;
  canCoyoteJump = false;
  coyoteTime = 150;
  coyoteTimeTimeout: number;

  jumpBufferTime = 125;
  jumpBufferTimeout: number;
  isJumpBuffered = false;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(20, 22);
    this.body.setOffset(6, 6);
    this.setGravityY(400);

    this.setCollideWorldBounds(true);
    this.createAnimations(scene);
  }

  createAnimations(scene) {
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
    if (cursors.left.isDown) {
      this.flipX = true;
    } else if (cursors.right.isDown) {
      this.flipX = false;
    }

    if (this.body.onFloor()) {
      this.updateGrounded(cursors);
    } else {
      this.updateAirborne(cursors);
    }
  }

  private updateAirborne(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    const { x: speedX, y: speedY } = this.body.velocity;

    if (!this.isJumping && this.canCoyoteJump) {
      this.setCoyoteTimeout();
    }

    if (Math.abs(speedY) < 10) {
      this.play('jump-float', true);
    } else if (speedY > 0) {
      this.play('jump-down', true);
    } else {
      this.play('jump-up', true);
    }

    if (cursors.left.isDown) {
      this.setVelocityX(-this.airborneSpeed);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.airborneSpeed);
    } else {
      const newSpeedX = Math.abs(speedX) < 10 ? 0 : speedX * 0.95;

      this.setVelocityX(newSpeedX);
    }

    this.handleJump(cursors);
  }

  private updateGrounded(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.isJumping = false;
    this.canCoyoteJump = true;
    this.clearCoyoteTimeout();

    if (this.isJumpBuffered) {
      this.jump();
      this.clearJumpBuffer();
    }

    if (cursors.left.isDown) {
      this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
      this.setVelocityX(-this.speed);
      this.play('walk', true);
    } else if (cursors.right.isDown) {
      this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
      this.setVelocityX(this.speed);
      this.play('walk', true);
    } else if (this.speed > this.deceleration) {
      const decelerationDirection = this.body.velocity.x < 0 ? -1 : 1;
      this.speed -= this.deceleration;
      this.setVelocityX(this.speed * decelerationDirection);
    } else {
      this.speed = 0;
      this.setVelocityX(0);
      this.play('idle', true);
    }

    this.handleJump(cursors);
  }

  private canJump() {
    return this.body.onFloor() || this.canCoyoteJump;
  }

  private handleJump(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (cursors.up.isDown && this.canJump()) {
      this.jump();
    } else if (cursors.up.isDown && !this.canJump()) {
      this.bufferJump();
    }
  }

  private jump() {
    this.isJumping = true;
    this.canCoyoteJump = false;
    this.clearCoyoteTimeout();
    this.setVelocityY(this.jumpSpeed);
  }

  private setCoyoteTimeout() {
    this.coyoteTimeTimeout = setTimeout(() => {
      this.canCoyoteJump = false;
    }, this.coyoteTime);
  }

  private clearCoyoteTimeout() {
    if (this.coyoteTimeTimeout) {
      clearTimeout(this.coyoteTimeTimeout);
      this.coyoteTimeTimeout = 0;
    }
  }

  private bufferJump() {
    this.isJumpBuffered = true;
    this.jumpBufferTimeout = setTimeout(() => {
      this.isJumpBuffered = false;
    }, this.jumpBufferTime);
  }

  private clearJumpBuffer() {
    this.isJumpBuffered = false;
    if (this.jumpBufferTimeout) {
      clearTimeout(this.jumpBufferTimeout);
      this.jumpBufferTimeout = 0;
    }
  }
}

export { Player };
