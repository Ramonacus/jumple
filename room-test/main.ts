import Phaser from 'phaser';

import { TestScene } from './scenes/test';

export const GAME_WIDTH = 512;
export const GAME_HEIGHT = 512;

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
  scene: TestScene,
};

const game = new Phaser.Game(config);
