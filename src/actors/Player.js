import Phaser from 'phaser';

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'dude');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(26, 38);
    this.body.setOffset(3, 10);

    this.setBounce(0.2);
    this.setCollideWorldBounds(true);

    // Movement and animation properties
    this.speed = 160;
    this.jumpSpeed = -350;

    this.createAnimations(scene);
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'left',
      frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    });

    scene.anims.create({
      key: 'right',
      frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  update(cursors) {
    if (cursors.left.isDown) {
      this.setVelocityX(-this.speed);
      this.play('left', true);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.speed);
      this.play('right', true);
    } else {
      this.setVelocityX(0);
      this.play('turn', true);
    }

    if (cursors.up.isDown && this.body.blocked.down) {
      this.setVelocityY(this.jumpSpeed);
    }
  }
}

export { Player };
