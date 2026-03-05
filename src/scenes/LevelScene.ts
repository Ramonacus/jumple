import { Exit } from '../actors/objects/Exit';
import { Spawn } from '../actors/objects/Spawn';
import { Obstacle, Spike } from '../actors/obstacles/Spikes';
import { Player } from '../actors/Player';
import { PlayerEvents } from '../types/events';
import {
  Layer,
  LayerName,
  LayerType,
  ObjectType,
  ObstacleType,
  RoomObject,
  RoomTilemap,
} from '../types/map';

class LevelScene extends Phaser.Scene {
  private readonly ROOM_WIDTH_TILES = 16; // TO DO: Determine a good size of the rooms

  private readonly ROOM_HEIGHT_TILES = 16;

  private camera: Phaser.Cameras.Scene2D.Camera;

  private terrain: Phaser.Tilemaps.TilemapLayer | null;

  private spawn: Spawn;

  private exit: Exit;

  private player: Player;

  private obstacles: Phaser.GameObjects.Group;

  private layout: RoomTilemap[][];

  preload() {
    this.load.spritesheet('player', 'assets/player-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image('tileset', 'assets/tilesets/base_tileset.png');
    this.load.image('spikes', 'assets/spikes.png');
    this.load.image('spawn', 'assets/spawn.png');
    this.load.image('exit', 'assets/exit.png');
  }

  constructor(layout: RoomTilemap[][]) {
    super();

    this.layout = layout;
    this.obstacles = this.add.group();
  }

  create() {
    this.camera = this.cameras.main;
    this.player = new Player(this, 0, 0);

    this.events.addListener(PlayerEvents.DEATH, this.onPlayerDeath, this);
  }

  update() {
    if (!this.input.keyboard) {
      throw new Error('No keyboard!');
    }

    const cursors = this.input.keyboard.createCursorKeys();
    this.player.update(cursors);
  }

  onPlayerDeath(): void {
    console.log('Player has died. Game Over.');
    this.physics.pause();
  }

  generateLevel() {
    const levelRowCount = this.layout.length * this.ROOM_HEIGHT_TILES;
    const levelColumnCount = this.layout[0].length * this.ROOM_WIDTH_TILES;

    let level = Array.from({ length: levelRowCount }, () =>
      Array(levelColumnCount).fill(0)
    );

    for (let i = 0; i < this.layout.length; i++) {
      for (let j = 0; j < this.layout[0].length; j++) {
        const room = this.layout[i][j];
        const terrainLayer = room.layers.find(
          (layer: Layer) => layer.type === LayerType.TERRAIN
        );

        if (!terrainLayer) {
          throw new Error(`Terrain layer not found in room ${room.type}.`);
        }

        this.spawnRoomGameObjects(room, j, i);
        this.fillRoomTerrain(level, terrainLayer, j, i);
      }
    }

    level = this.fillLevelBorders(level);
    const map = this.make.tilemap({
      data: level,
      tileWidth: 16,
      tileHeight: 16,
    });

    const tileset = map.addTilesetImage('tileset', 'tileset');
    if (!tileset) {
      throw new Error('Could not create tileset for level.');
    }

    this.terrain = map.createLayer(0, tileset);

    if (!this.terrain) {
      throw new Error('Could not generate the platforms layer.');
    }

    this.terrain.setCollisionByExclusion([-1]);
    return level;
  }

  private fillRoomTerrain(
    level: number[][],
    terrainLayer: Layer,
    offsetX: number,
    offsetY: number
  ) {
    terrainLayer.data.forEach((tile, tileIndex) => {
      const tileRow =
        this.ROOM_HEIGHT_TILES * offsetY +
        Math.floor(tileIndex / this.ROOM_WIDTH_TILES);
      const tileColumn =
        this.ROOM_WIDTH_TILES * offsetX + (tileIndex % this.ROOM_WIDTH_TILES);

      level[tileRow][tileColumn] = tile - 1;
    });
  }

  private spawnRoomGameObjects(
    room: RoomTilemap,
    offsetX: number,
    offsetY: number
  ): void {
    room.layers.forEach((layer: Layer) => {
      switch (layer.name) {
        case LayerName.OBJECTS:
          this.spawnRoomObjects(layer, offsetX, offsetY);
          break;
        case LayerName.OBSTACLES:
          this.spawnRoomObstacles(layer, offsetX, offsetY);
          break;
      }
    });
  }

  private spawnRoomObjects(
    objectsLayer: Layer,
    offsetX: number,
    offsetY: number
  ) {
    if (!objectsLayer.objects) {
      return;
    }

    objectsLayer.objects.forEach((obj: RoomObject) => {
      switch (obj.name) {
        case ObjectType.SPAWN:
          this.spawn = this.instanceSpawnObject(obj, offsetX, offsetY);
          break;
        case ObjectType.EXIT:
          this.exit = new Exit(
            this,
            this.player,
            obj.x + offsetX * this.ROOM_WIDTH_TILES * 16,
            obj.y + offsetY * this.ROOM_HEIGHT_TILES * 16
          );
          break;
      }
    });
  }

  private spawnRoomObstacles(
    obstaclesLayer: Layer,
    offsetX: number,
    offsetY: number
  ): void {
    if (!obstaclesLayer.objects) {
      return;
    }

    obstaclesLayer.objects.forEach((obj: RoomObject) => {
      switch (obj.name) {
        case ObstacleType.SPIKES:
          this.obstacles.add(
            new Spike(
              obj,
              this,
              obj.x + offsetX * this.ROOM_WIDTH_TILES * 16,
              obj.y + offsetY * this.ROOM_HEIGHT_TILES * 16
            )
          );
          break;
      }
    });
  }

  private instanceSpawnObject(
    spawnObject: RoomObject,
    offsetX: number,
    offsetY: number
  ) {
    const spawn = new Spawn(
      this,
      spawnObject.x + offsetX * this.ROOM_WIDTH_TILES * 16,
      spawnObject.y + offsetY * this.ROOM_HEIGHT_TILES * 16,
      spawnObject.width,
      spawnObject.height
    );

    return spawn;
  }

  private fillLevelBorders(level: number[][]): number[][] {
    const levelHeight = level.length;
    const levelWidth = level[0].length;

    level[0] = Array(levelWidth).fill(0);
    level[levelHeight - 1] = Array(levelWidth).fill(0);

    level.forEach((row) => {
      row[0] = 0;
      row[levelWidth - 1] = 0;
    });

    return level;
  }

  hasSpawn(): boolean {
    return !!this.spawn;
  }

  getSpawn(): Spawn {
    return this.spawn;
  }

  start(): void {
    this.setPlayerCollisions();
    this.spawn.spawnPlayer(this.player);
  }

  // TODO: Move to Player?
  private setPlayerCollisions(): void {
    if (!this.terrain) {
      throw new Error('No terrain layer to set collisions with!');
    }

    this.physics.add.collider(this.player, this.terrain);
    this.physics.add.collider(this.player, this.obstacles, (_, obstacle) =>
      this.onPlayerObstacleCollision(this.player, obstacle as Obstacle)
    );
  }

  private onPlayerObstacleCollision(player: Player, obstacle: Obstacle): void {
    obstacle.onPlayerCollision(player);
  }
}

export { LevelScene };
