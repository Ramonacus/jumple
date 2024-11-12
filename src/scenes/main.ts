import Phaser, { Scene } from 'phaser';

import { Player } from '../actors/Player';
import { Bombs } from '../actors/Bombs';
import { Level } from './Level';

let stars;
let score = 0;
let scoreText;
let gameOver = false;

class MainScene extends Scene {
  player: Player;
  bombs: Bombs;
  level: Level;

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('player', 'assets/player-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.image('tileset', 'assets/maps/tileset.png');
    this.load.tilemapTiledJSON('test-map', 'assets/maps/test-map.json');
  }

  create() {
    this.add.image(180, 240, 'sky');

    this.level = new Level(this);
    const player = (this.player = new Player(this, 100, 450));

    stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      return true;
    });

    this.physics.add.collider(stars, this.level.platformsLayer);
    this.physics.add.collider(player, this.level.platformsLayer);

    this.physics.add.overlap(player, stars, collectStar, undefined, this);

    scoreText = this.add.text(16, 16, 'score: ' + score, {
      fontSize: '32px',
      color: '#000',
    });

    this.bombs = new Bombs(
      this,
      player,
      this.level.platformsLayer,
      hitBombFactory(this)
    );
  }

  update() {
    if (!this.input.keyboard) {
      throw new Error('No keyboard!');
    }

    if (gameOver) {
      return;
    }
    const cursors = this.input.keyboard.createCursorKeys();
    this.player.update(cursors);
  }
}

function collectStar(_, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);

  const activeStars = stars.countActive(true);

  if (activeStars === 0) {
    stars.children.iterate((child) =>
      child.enableBody(true, child.x, 0, true, true)
    );
  }

  if (activeStars % 2 === 0) {
    this.bombs.addBomb();
  }
}

function hitBombFactory(scene: Scene) {
  return function hitBomb(playerObject) {
    scene.physics.pause();
    playerObject.setTint(0xff0000);
    playerObject.anims.play('jump-down');
    gameOver = true;

    scene.add
      .text(400, 300, 'Game Over', {
        fontSize: '64px',
        color: '#F00',
      })
      .setOrigin(0.5);
  };
}

export { MainScene };
