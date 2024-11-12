class Level extends Phaser.GameObjects.GameObject {
  private _platformsLayer: Phaser.Tilemaps.TilemapLayer | null;

  constructor(scene) {
    super(scene, '');

    this.generateLevel();
  }

  get platformsLayer(): Phaser.Tilemaps.TilemapLayer {
    if (!this._platformsLayer) {
      throw new Error('Platforms layer does not exist.');
    }

    return this._platformsLayer;
  }

  generateLevel() {
    const map = this.scene.add.tilemap('test-map');
    const tiles = map.addTilesetImage('tileset');

    if (!tiles) {
      throw new Error('Could not find level tiles.');
    }

    this._platformsLayer = map.createLayer('platforms', tiles);

    if (!this._platformsLayer) {
      throw new Error('Could not generate the platforms layer.');
    }

    this._platformsLayer.setCollisionBetween(0, tiles.columns * tiles.rows);
  }
}

export { Level };
