import Phaser from 'phaser';

import { MainScene } from './scenes/main';

export const GAME_WIDTH = 640; // 40 * 16
export const GAME_HEIGHT = 480; // 30 * 16
export const TILE_SIZE = 16;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  antialias: false,
  pixelArt: true,
  backgroundColor: '#ccc',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 450 },
      debug: false,
    },
  },
  scene: MainScene,
};

const game = new Phaser.Game(config);
