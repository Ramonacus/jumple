import { Player } from './Player';

class Spawn extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y + 32, 'spawn');

    this.width = width;
    this.height = height;
    this.scene.add.existing(this);
  }

  spawnPlayer(): Player {
    return new Player(this.scene, this.x, this.y);
  }
}

export { Spawn };
