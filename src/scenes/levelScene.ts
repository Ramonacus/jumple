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
import { CriticalPathStep, RoomNode } from '../types/rooms';

class LevelScene extends Phaser.Scene {
  protected camera!: Phaser.Cameras.Scene2D.Camera;

  private roomLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  private spawn!: Spawn;

  private exit!: Exit;

  protected player!: Player;

  private obstacles!: Phaser.GameObjects.Group;

  private levelRoot!: RoomNode;

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

  constructor() {
    super();
  }

  init(data: { levelRoot: RoomNode }) {
    this.levelRoot = data.levelRoot;
  }

  create() {
    this.camera = this.cameras.main;
    this.player = new Player(this, 0, 0);
    this.obstacles = this.add.group();

    this.events.addListener(PlayerEvents.DEATH, this.onPlayerDeath, this);
    this.generateLevel();
    this.startLevel();
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
    let room: RoomNode | null = this.levelRoot;
    let offsetX = 0;
    let offsetY = 0;

    while (room) {
      this.spawnRoom(room, offsetX, offsetY);
      offsetX =
        room?.step === CriticalPathStep.RIGHT
          ? offsetX + (room?.roomTemplate?.width ?? 0)
          : offsetX;

      offsetY =
        room?.step === CriticalPathStep.UP
          ? offsetY - (room?.roomTemplate?.height ?? 0)
          : offsetY;

      room = room.next;
    }
  }

  private spawnRoom(
    roomNode: RoomNode,
    offsetX: number,
    offsetY: number
  ): void {
    const room = roomNode.roomTemplate;

    if (!room) {
      throw new Error(`No room template in room ${JSON.stringify(roomNode)}`);
    }

    const terrainLayerData = room.layers.find(
      (layer: Layer) => layer.type === LayerType.TERRAIN
    );

    if (!terrainLayerData) {
      throw new Error(`Terrain layer not found in room ${room.type}.`);
    }

    const roomTiles = this.getRoomTiles(roomNode);
    const roomTilemap = this.make.tilemap({
      data: roomTiles,
      tileWidth: 16,
      tileHeight: 16,
    });

    const tileset = roomTilemap.addTilesetImage('tileset', 'tileset');
    if (!tileset) {
      throw new Error('Could not create tileset for level.');
    }

    const roomLayer = roomTilemap.createLayer(
      0,
      tileset,
      offsetX * 16,
      offsetY * 16
    );

    if (!roomLayer) {
      throw new Error('Could not create terrain layer.');
    }

    roomLayer.setCollisionByExclusion([-1]);
    this.spawnRoomGameObjects(room, roomLayer.x, roomLayer.y);
    this.roomLayers.push(roomLayer);
  }

  private getRoomTiles(roomNode: RoomNode): number[][] {
    const room = roomNode.roomTemplate;

    if (!room) {
      throw new Error(
        `No room template in room ${JSON.stringify(this.levelRoot)}`
      );
    }

    const terrainLayer = room.layers.find(
      (layer: Layer) => layer.type === LayerType.TERRAIN
    );

    if (!terrainLayer) {
      throw new Error(`Terrain layer not found in room ${room.type}.`);
    }

    const roomWidth = terrainLayer.width;
    const roomHeight = terrainLayer.height;
    const terrainTiles: number[][] = Array.from({ length: roomHeight }, () =>
      Array(roomWidth).fill(0)
    );

    terrainLayer.data.forEach((tile, tileIndex) => {
      const tileRow = Math.floor(tileIndex / roomHeight);
      const tileColumn = tileIndex % roomWidth;
      terrainTiles[tileRow][tileColumn] = tile - 1;
    });

    return terrainTiles;
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
            obj.x + offsetX,
            obj.y + offsetY
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
            new Spike(obj, this, obj.x + offsetX, obj.y + offsetY)
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
      spawnObject.x + offsetX,
      spawnObject.y + offsetY,
      spawnObject.width,
      spawnObject.height
    );

    return spawn;
  }

  hasSpawn(): boolean {
    return !!this.spawn;
  }

  getSpawn(): Spawn {
    return this.spawn;
  }

  startLevel(): void {
    this.setPlayerCollisions();
    this.spawn.spawnPlayer(this.player);
    this.camera.startFollow(this.player);
  }

  protected setPlayerCollisions(): void {
    this.roomLayers.forEach((tilesLayer) => {
      this.physics.add.collider(this.player, tilesLayer);
    });

    this.physics.add.collider(this.player, this.obstacles, (_, obstacle) =>
      this.onPlayerObstacleCollision(this.player, obstacle as Obstacle)
    );
  }

  private onPlayerObstacleCollision(player: Player, obstacle: Obstacle): void {
    obstacle.onPlayerCollision(player);
  }
}

export { LevelScene };
