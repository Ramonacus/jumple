import Phaser, { Scene } from 'phaser';
import { LevelLayoutGenerator } from '../rooms/LevelGenerator';
import { RoomManager } from '../rooms/RoomsManager';
import { LevelScene } from './levelScene';

class MainScene extends Scene {
  levelGenerator!: LevelLayoutGenerator;

  roomsManager!: RoomManager;

  preload() {
    this.roomsManager = new RoomManager(this);
    this.roomsManager.loadRooms();
  }

  create() {
    this.levelGenerator = new LevelLayoutGenerator(5, 5, this.roomsManager);
    const levelRoot = this.levelGenerator.generateLevelLayout(15);
    const levelScene = this.scene.add('LevelScene', LevelScene, true, {
      levelRoot,
    });
  }
}

export { MainScene };
