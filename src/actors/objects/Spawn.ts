import { Player } from '../Player';

class Spawn extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y + 16, 'spawn');

    this.width = width;
    this.height = height;
    this.scene.add.existing(this);
  }

  spawnPlayer(player: Player): void {
    player.spawn(this.x, this.y);
  }
}

export { Spawn };
