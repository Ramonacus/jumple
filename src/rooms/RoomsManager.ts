import { MapTileset } from '../types/map';
import { RoomType } from '../types/rooms';
import { ROOMS } from './rooms';

class RoomManager {
  scene: Phaser.Scene;

  roomsMap: Map<RoomType, string[]> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadRooms();
  }

  loadRooms() {
    const roomKeys = Object.keys(ROOMS);

    roomKeys.forEach((roomKey) => {
      const roomType = Number(roomKey) as RoomType;
      const roomPaths = ROOMS[roomType];

      this.roomsMap.set(roomType, []);
      roomPaths.forEach((roomPath, index) => {
        const roomKey = `rooms-${roomType}-${index}`;
        this.roomsMap.get(roomType)?.push(roomKey);
        this.scene.load.json(roomKey, `assets/rooms/${roomPath}`);
      });
    });
  }

  getRandomRoomOfType(roomType: RoomType): MapTileset {
    const rooms = this.roomsMap.get(roomType);
    if (!rooms || rooms.length === 0) {
      throw new Error(`No rooms available for room type: ${roomType}`);
    }

    const randomIndex = Math.floor(Math.random() * rooms.length);
    const roomKey = rooms[randomIndex];

    if (!this.scene.cache.json.exists(roomKey)) {
      throw new Error(`Room JSON not found in cache for key: ${roomKey}`);
    }

    return this.scene.cache.json.get(roomKey) as MapTileset;
  }
}

export { RoomManager };
