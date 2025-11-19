import Phaser, { Scene } from 'phaser';

import { Player } from '../actors/Player';
import { Level } from '../terrain/Level';
import { LevelGenerator } from '../terrain/LevelGenerator';
import { RoomManager } from '../rooms/RoomsManager';
import { Obstacle } from '../actors/Spikes';
import { PlayerEvents } from '../types/events';

let gameOver = false;

class MainScene extends Scene {
  player: Player;

  levelGenerator: LevelGenerator;

  level: Level;

  camera: Phaser.Cameras.Scene2D.Camera;

  roomsManager: RoomManager;

  preload() {
    this.load.spritesheet('player', 'assets/player-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image('tileset', 'assets/tilesets/base_tileset.png');
    this.load.image('spikes', 'assets/spikes.png');
    this.load.image('spawn', 'assets/spawn.png');
    this.roomsManager = new RoomManager(this);
    this.roomsManager.loadRooms();
  }

  create() {
    this.camera = this.cameras.main;

    this.levelGenerator = new LevelGenerator(5, 5, this.roomsManager);
    this.level = this.levelGenerator.createLevel(this);

    if (!this.level.hasSpawn()) {
      throw new Error('Level has no spawn point.');
    }

    const playerSpawn = this.level.getSpawn();
    const player = playerSpawn.spawnPlayer();

    this.physics.add.collider(player, this.level.platformsLayer);
    this.physics.add.collider(player, this.level.obstacles, (_, obstacle) =>
      this.onPlayerObstacleCollision(player, obstacle as Obstacle)
    );

    player.body.collideWorldBounds = false;
    this.player = player;
    this.camera.startFollow(player, true, 0.2, 0.2, 0, 75);

    this.events.addListener(PlayerEvents.DEATH, this.onPlayerDeath, this);
  }

  update() {
    if (!this.input.keyboard) {
      throw new Error('No keyboard!');
    }

    if (gameOver) {
      this.physics.pause();
      return;
    }

    const cursors = this.input.keyboard.createCursorKeys();
    this.player.update(cursors);
  }

  onPlayerObstacleCollision(player: Player, obstacle: Obstacle): void {
    obstacle.onPlayerCollision(player);
  }

  onPlayerDeath(): void {
    console.log('Player has died. Game Over.');
    gameOver = true;
  }
}

export { MainScene };
