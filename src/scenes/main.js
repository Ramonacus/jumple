import Phaser, { Scene } from 'phaser';

import { Player } from '../actors/Player';
import { Bombs } from '../actors/Bombs';

let stars;
let score = 0;
let scoreText;
let gameOver = false;

class MainScene extends Scene {
  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('player', 'assets/player-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }
  create() {
    this.add.image(400, 300, 'sky');

    const platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    const player = (this.player = new Player(this, 100, 450));
    this.physics.add.collider(player, platforms);

    stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      return true;
    });

    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, collectStar, undefined, this);

    scoreText = this.add.text(16, 16, 'score: ' + score, {
      fontSize: '32px',
      fill: '#000',
    });

    this.bombs = new Bombs(this, player, platforms, hitBombFactory);
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

function collectStar(playerObject, star) {
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

function hitBombFactory(scene) {
  return function hitBomb(playerObject) {
    scene.physics.pause();
    playerObject.setTint(0xff0000);
    playerObject.anims.play('jump-down');
    gameOver = true;

    scene.add
      .text(400, 300, 'Game Over', {
        fontSize: '64px',
        fill: '#F00',
      })
      .setOrigin(0.5);
  };
}

export { MainScene };
