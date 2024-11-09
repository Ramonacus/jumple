import Phaser from 'phaser';

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(20, 22);
    this.body.setOffset(6, 6);
    this.setGravityY(400);

    this.setCollideWorldBounds(true);

    // Movement and animation properties
    this.speed = 160;
    this.jumpSpeed = -520;

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

  update(cursors) {
    if (cursors.left.isDown) {
      this.flipX = true;
    } else if (cursors.right.isDown) {
      this.flipX = false;
    }

    if (this.body.blocked.down) {
      this.updateGrounded(cursors);
    } else {
      this.updateAirborne(cursors);
    }
  }

  updateAirborne(cursors) {
    const { x: speedX, y: speedY } = this.body.velocity;

    if (Math.abs(speedY) < 10) {
      this.play('jump-float', true);
    } else if (speedY > 0) {
      this.play('jump-down', true);
    } else {
      this.play('jump-up', true);
    }
    if (cursors.left.isDown) {
      this.setVelocityX(-this.speed);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.speed);
    } else {
      const newSpeedX = Math.abs(speedX) < 10 ? 0 : speedX * 0.95;

      this.setVelocityX(newSpeedX);
    }
  }

  updateGrounded(cursors) {
    if (cursors.left.isDown) {
      this.setVelocityX(-this.speed);
      this.play('walk', true);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.speed);
      this.play('walk', true);
    } else {
      this.setVelocityX(0);
      this.play('idle', true);
    }

    if (cursors.up.isDown) {
      this.setVelocityY(this.jumpSpeed);
    }
  }
}

export { Player };
