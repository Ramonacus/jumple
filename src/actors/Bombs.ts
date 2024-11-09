import Phaser, { Scene } from 'phaser';

import { Player } from './Player';

class Bombs extends Phaser.Physics.Arcade.Group {
  player: Player;

  constructor(
    scene: Scene,
    player: Player,
    platforms: Phaser.Physics.Arcade.StaticGroup,
    callback: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback
  ) {
    super(scene.physics.world, scene);

    scene.physics.add.collider(this, platforms);
    scene.physics.add.collider(player, this, callback, undefined, this);

    this.player = player;
  }

  addBomb() {
    const newBombX =
      this.player.x > 400
        ? Phaser.Math.Between(0, 400)
        : Phaser.Math.Between(400, 800);
    const newBomb = this.create(newBombX, 16, 'bomb');
    newBomb.setBounce(1);
    newBomb.setCollideWorldBounds();
    newBomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

export { Bombs };
