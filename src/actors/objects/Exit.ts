import Phaser from 'phaser';
import { Player } from '../Player';

class Exit extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, player: Player, x: number, y: number) {
    super(scene, x, y + 16, 'exit');

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, true);
    this.body.setSize(32, 32);

    this.scene.physics.add.overlap(player, this, () => {
      console.log('Player reached the exit!');
    });
  }
}

export { Exit };
