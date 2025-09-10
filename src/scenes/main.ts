import Phaser, { Scene } from 'phaser';

import { Player } from '../actors/Player';
import { Level } from '../terrain/Level';
import { LevelGenerator } from '../terrain/LevelGenerator';
import { GAME_HEIGHT, GAME_WIDTH } from '../game';

let stars;
let score = 0;
let scoreText;
let gameOver = false;

export const ROOMS = {
  'rooms-0': [''], // rooms with spawn point
  'rooms-1': ['assets/maps/test-map.json'],
};

class MainScene extends Scene {
  player: Player;
  levelGenerator: LevelGenerator;
  level: Level;

  camera: Phaser.Cameras.Scene2D.Camera;

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.spritesheet('player', 'assets/player-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.image('tileset', 'assets/maps/tileset.png');

    // Load all rooms tilemaps
    Object.keys(ROOMS).forEach((key) => {
      const rooms = ROOMS[key];
      rooms.forEach((roomPath, i) => {
        this.load.json(key + `-${i}`, roomPath);
      });
    });
  }

  create() {
    this.add.image(180, 240, 'sky');

    this.camera = this.cameras.main;

    this.levelGenerator = new LevelGenerator(GAME_WIDTH, GAME_HEIGHT, 2, 2);
    this.level = this.levelGenerator.createLevel(this);
    const player = (this.player = new Player(this, 0, 0));

    this.physics.add.collider(player, this.level.platformsLayer);
    player.body.collideWorldBounds = false;
    this.camera.startFollow(player, true, 0.2, 0.2, 0, 75);
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
