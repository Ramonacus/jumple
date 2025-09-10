import Phaser from 'phaser';

import { MainScene } from './scenes/main';

export const GAME_WIDTH = 360; // 45 * 8
export const GAME_HEIGHT = 480; // 60 * 8

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  antialias: false,
  pixelArt: true,
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
