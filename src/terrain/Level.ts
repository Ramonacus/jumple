import { Scene } from 'phaser';
import { Spawn } from '../actors/Spawn';
import { RoomType } from '../types/rooms';
import { RoomManager } from '../rooms/RoomsManager';
import {
  Layer,
  LayerType,
  ObjectType,
  ObstacleType,
  RoomObject,
  RoomTilemap,
} from '../types/map';
import { TILE_SIZE } from '../game';
import { Spike } from '../actors/Spikes';

class Level extends Phaser.GameObjects.GameObject {
  private readonly ROOM_WIDTH_TILES = 45; // TO DO: Determine a good size of the rooms

  private readonly ROOM_HEIGHT_TILES = 60;

  private _platformsLayer: Phaser.Tilemaps.TilemapLayer | null;

  private spawn: Spawn;

  private _obstacles: Phaser.GameObjects.Group;

  get obstacles(): Phaser.GameObjects.Group {
    return this._obstacles;
  }

  get platformsLayer(): Phaser.Tilemaps.TilemapLayer {
    if (!this._platformsLayer) {
      throw new Error('Platforms layer does not exist.');
    }

    return this._platformsLayer;
  }

  constructor(
    public scene: Scene,
    private roomsManager: RoomManager,
    private layout: RoomType[][]
  ) {
    super(scene, '');
    this._obstacles = this.scene.add.group();

    this.generateLevel();
  }

  generateLevel() {
    const levelRowCount = this.layout.length * this.ROOM_HEIGHT_TILES;
    const levelColumnCount = this.layout[0].length * this.ROOM_WIDTH_TILES;

    let level = Array.from({ length: levelRowCount }, () =>
      Array(levelColumnCount).fill(0)
    );

    for (let i = 0; i < this.layout.length; i++) {
      for (let j = 0; j < this.layout[0].length; j++) {
        const roomType = this.layout[i][j];
        const room = this.roomsManager.getRandomRoomOfType(roomType);

        if (
          room.width !== this.ROOM_WIDTH_TILES ||
          room.height !== this.ROOM_HEIGHT_TILES
        ) {
          throw new Error(
            `Room size mismatch. Expected ${this.ROOM_WIDTH_TILES}x${this.ROOM_HEIGHT_TILES}, got ${room.width}x${room.height}.`
          );
        }

        const terrainLayer = room.layers.find(
          (layer: Layer) => layer.name === LayerType.TERRAIN
        );

        if (!terrainLayer) {
          throw new Error(
            `Terrain layer not found in room of type ${roomType}.`
          );
        }

        this.spawnRoomGameObjects(room, j, i);
        this.fillRoomTerrain(level, terrainLayer, j, i);
      }
    }

    level = this.fillLevelBorders(level);
    const map = this.scene.make.tilemap({
      data: level,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    const tileset = map.addTilesetImage('tileset', 'tileset');
    console.log('tileset', tileset);
    if (!tileset) {
      throw new Error('Could not create tileset for level.');
    }

    this._platformsLayer = map.createLayer(0, tileset);

    if (!this._platformsLayer) {
      throw new Error('Could not generate the platforms layer.');
    }

    this._platformsLayer.setCollisionByExclusion([-1]);
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
        case LayerType.OBJECTS:
          this.spawnRoomObjects(layer, offsetX, offsetY);
          break;
        case LayerType.OBSTACLES:
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
      console.log('Spawning obstacle:', obj);
      switch (obj.name) {
        case ObstacleType.SPIKES:
          this._obstacles.add(
            new Spike(
              obj,
              this.scene,
              obj.x + offsetX * this.ROOM_WIDTH_TILES * TILE_SIZE,
              obj.y + offsetY * this.ROOM_HEIGHT_TILES * TILE_SIZE
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
      this.scene,
      spawnObject.x + offsetX * this.ROOM_WIDTH_TILES * TILE_SIZE,
      spawnObject.y + offsetY * this.ROOM_HEIGHT_TILES * TILE_SIZE,
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

  public hasSpawn(): boolean {
    return !!this.spawn;
  }

  public getSpawn(): Spawn {
    return this.spawn;
  }
}

export { Level };
