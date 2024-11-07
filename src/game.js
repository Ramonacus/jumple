import Phaser from 'phaser';

import { MainScene } from './scenes/main';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false,
    },
  },
  scene: MainScene,
};

const game = new Phaser.Game(config);

window.game = game;
