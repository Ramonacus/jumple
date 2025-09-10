import { Scene } from 'phaser';
import { ROOMS } from '../scenes/main';
import { MapObject } from '../types';

const PLATFORMS_LAYER_NAME = 'platforms';

class Level extends Phaser.GameObjects.GameObject {
  private _platformsLayer: Phaser.Tilemaps.TilemapLayer | null;

  private levelRowCount: number;

  private levelColumnCount: number;

  constructor(
    public scene: Scene,
    private layout: number[][],
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

        if (roomType === 0) {
          continue;
        }

        const roomTypeKey = `rooms-${roomType}`;

        if (!ROOMS[roomTypeKey] || ROOMS[roomTypeKey].length === 0) {
          throw new Error(`'Invalid room type: ${roomType}`);
        }

        // Select random room for the corresponding type
        const roomIndex = Math.round(
          Math.random() * (ROOMS[roomTypeKey].length - 1)
        );
        const roomKey = `rooms-1-${roomIndex}`;
        const roomJson: MapObject = this.scene.cache.json.get(roomKey);

        if (!roomJson) {
          throw new Error(`Couldn't find ${roomKey} room json.`);
        }

        //Copy room layout to full level array
        const platformsLayer = roomJson.layers.filter(
          (layer) => layer.name === PLATFORMS_LAYER_NAME
        );

        if (platformsLayer.length === 0) {
          throw new Error(`Platforms layer not found in ${roomKey}`);
        }

        // Fill level with room info
        platformsLayer[0].data.forEach((tile, tileIndex) => {
          const tileRow =
            this.roomHeight * i + Math.floor(tileIndex / this.roomWidth);
          const tileColumn = this.roomWidth * j + (tileIndex % this.roomWidth);
          level[tileRow][tileColumn] = tile > 0 ? tile - 1 : 0;
        });
      }
    }

    level = this.fillLevelBorders(level);

    const map = this.scene.make.tilemap({
      data: level,
      tileWidth: 8,
      tileHeight: 8,
    });
    const tiles = map.addTilesetImage('tileset');

    if (!tiles) {
      throw new Error('Could not find level tiles.');
    }

    this._platformsLayer = map.createLayer(0, tiles);

    if (!this._platformsLayer) {
      throw new Error('Could not generate the platforms layer.');
    }

    this._platformsLayer.setCollisionBetween(0, this._platformsLayer.width);
    return level;
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
}

export { Level };
