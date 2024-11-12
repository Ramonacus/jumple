import Phaser from 'phaser';

import { MainScene } from './scenes/main';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 360, // 45 * 8
  height: 480, // 60 * 8
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
