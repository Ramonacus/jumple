import { RoomManager } from '../../src/rooms/RoomsManager';
import { RoomNode, RoomType } from '../../src/types/rooms';
import { RoomsLoadedEvent } from '../events/RoomsLoadedEvent';
import { RoomScene } from './roomScene';

class TestScene extends Phaser.Scene {
  ROOM_SELECTOR_ID = 'room-select';

  roomsManager: RoomManager | undefined;

  preload() {
    this.roomsManager = new RoomManager(this);
    this.roomsManager.loadRooms();

    this.notifyRoomsLoaded();
    this.listenSelectedRoomChanges();
  }

  update(time: number, delta: number) {
    const pointer = this.input.activePointer;
    const cursors = this.input.keyboard?.createCursorKeys();

    if (cursors?.shift.isDown && pointer.isDown) {
      const roomScene = this.scene.get('RoomScene') as RoomScene;

      if (roomScene) {
        roomScene.spawnPlayer(pointer.worldX, pointer.worldY);
      }
    }
  }

  notifyRoomsLoaded() {
    const event = new RoomsLoadedEvent(
      this.roomsManager?.getAllRoomKeys() || []
    );
    document.dispatchEvent(event);
  }

  listenSelectedRoomChanges() {
    const selectorEl = document.getElementById(this.ROOM_SELECTOR_ID);

    if (!selectorEl) {
      throw new Error('No room selector!');
    }

    selectorEl.addEventListener('change', this.onRoomSelected.bind(this));
  }

  onRoomSelected(event: Event) {
    const newRoomId = event.target?.value;
    const room = this.roomsManager?.getRoomByKey(newRoomId);

    if (!room) {
      throw new Error(`Room ${newRoomId} not loaded...`);
    }

    const existingScene = this.scene.get('RoomScene');
    const roomNode: RoomNode = {
      index: 0,
      next: null,
      roomTemplate: room,
      step: null,
      type: RoomType.START,
    };

    if (existingScene) {
      this.scene.remove('RoomScene');
    }

    this.scene.add('RoomScene', RoomScene, true, { levelRoot: roomNode });
  }
}

export { TestScene };
