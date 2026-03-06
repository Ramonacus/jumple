import { RoomTilemap } from '../types/map';
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

      const rooms: string[] = [];
      roomPaths.forEach((roomPath, index) => {
        const roomKey = `rooms-${roomType}-${index}`;

        rooms.push(roomKey);
        this.scene.load.json(roomKey, `assets/rooms/${roomPath}`);
      });

      this.roomsMap.set(roomType, rooms);
    });
  }

  getRoomByKey(key: string): RoomTilemap | null {
    if (!this.scene.cache.json.exists(key)) {
      return null;
    }

    return this.scene.cache.json.get(key) as RoomTilemap;
  }

  getRandomRoomOfType(roomType: RoomType): RoomTilemap {
    const rooms = this.roomsMap.get(roomType);
    if (!rooms || rooms.length === 0) {
      throw new Error(`No rooms available for room type: ${roomType}`);
    }

    const randomIndex = Math.floor(Math.random() * rooms.length);
    const roomKey = rooms[randomIndex];

    if (!this.scene.cache.json.exists(roomKey)) {
      throw new Error(`Room JSON not found in cache for key: ${roomKey}`);
    }

    return this.scene.cache.json.get(roomKey) as RoomTilemap;
  }

  getAllRoomKeys(): string[] {
    let roomNames: string[] = [];

    this.roomsMap.forEach((r) => {
      roomNames = roomNames.concat(r);
    });

    return roomNames;
  }
}

export { RoomManager };
