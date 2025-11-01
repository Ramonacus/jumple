import { Player } from './Player';

class Spawn extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y, 'spawn');

    this.width = width;
    this.height = height;
    this.scene.add.existing(this);
  }

  spawnPlayer(): Player {
    return new Player(
      this.scene,
      this.x + this.width / 2,
      this.y - this.height
    );
  }
}

export { Spawn };
