import { Scene } from 'phaser';
import { Spawn } from '../actors/Spawn';
import { RoomType } from '../types/rooms';
import { RoomManager } from '../rooms/RoomsManager';
import { Layer, LayerType, RoomObject, RoomTilemap } from '../types/map';

class Level extends Phaser.GameObjects.GameObject {
  private _platformsLayer: Phaser.Tilemaps.TilemapLayer | null;

  private levelRowCount: number;

  private levelColumnCount: number;

  private spawn: Spawn;

  constructor(
    public scene: Scene,
    private roomsManager: RoomManager,
    private layout: RoomType[][],
    private roomWidth: number,
    private roomHeight: number
  ) {
    super(scene, '');

    this.levelRowCount = this.roomHeight * this.layout.length;
    this.levelColumnCount = this.roomWidth * this.layout[0].length;
    this.generateLevel();
  }

  get platformsLayer(): Phaser.Tilemaps.TilemapLayer {
    if (!this._platformsLayer) {
      throw new Error('Platforms layer does not exist.');
    }

    return this._platformsLayer;
  }

  generateLevel() {
    let level = Array.from({ length: this.levelRowCount }, () =>
      Array(this.levelColumnCount).fill(0)
    );

    for (let i = 0; i < this.layout.length; i++) {
      for (let j = 0; j < this.layout[0].length; j++) {
        const roomType = this.layout[i][j];
        const room = this.roomsManager.getRandomRoomOfType(roomType);
        const terrainLayer = room.layers.find(
          (layer: Layer) => layer.name === LayerType.TERRAIN
        );

        if (!terrainLayer) {
          throw new Error(
            `Terrain layer not found in room of type ${roomType}.`
          );
        }

        this.spawnRoomObjects(room, j, i);
        this.fillRoomTerrain(level, terrainLayer, j, i);
      }
    }

    level = this.fillLevelBorders(level);
    const map = this.scene.make.tilemap({
      data: level,
      tileWidth: 16, //TODO: fix magic number (tile size)
      tileHeight: 16,
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
        this.roomHeight * offsetY + Math.floor(tileIndex / this.roomWidth);
      const tileColumn =
        this.roomWidth * offsetX + (tileIndex % this.roomWidth);
      level[tileRow][tileColumn] = tile - 1;
    });
  }

  private spawnRoomObjects(
    room: RoomTilemap,
    offsetX: number,
    offsetY: number
  ) {
    const objectsLayer = room.layers.find(
      (layer: Layer) => layer.name === LayerType.OBJECTS
    );

    if (!objectsLayer || !objectsLayer.objects) {
      throw new Error('Objects layer not found in start room.');
    }

    objectsLayer.objects.forEach((obj: RoomObject) => {
      switch (obj.name) {
        case 'Spawn':
          this.spawn = this.getRoomSpawnObject(obj, offsetX, offsetY);
          break;
      }
    });
  }

  private getRoomSpawnObject(
    spawnObject: RoomObject,
    offsetX: number,
    offsetY: number
  ): Spawn {
    const spawn = new Spawn(
      this.scene,
      spawnObject.x + offsetX * this.roomWidth * 16, //TODO: fix magic number (tile size)
      spawnObject.y + offsetY * this.roomHeight * 16, //TODO: fix magic number (tile size)
      spawnObject.width,
      spawnObject.height
    );

    this.spawn = spawn;
    return spawn;
  }

  private fillLevelBorders(level: number[][]): number[][] {
    level[0] = Array(this.levelColumnCount).fill(1);
    level[this.levelRowCount - 1] = Array(this.levelColumnCount).fill(1);

    level.forEach((row) => {
      row[0] = 1;
      row[this.levelColumnCount - 1] = 1;
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
