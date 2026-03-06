import { CriticalPathStep, RoomNode, RoomType } from '../types/rooms';
import { RoomManager } from './RoomsManager';

class LevelLayoutGenerator {
  constructor(
    private levelWidth: number,
    private levelHeight: number,
    private roomsManager: RoomManager
  ) {
    if (this.levelWidth <= 0 || this.levelHeight < 0) {
      throw new Error('Invalid layout size.');
    }
  }

  generateLevelLayout(targetLength: number): RoomNode {
    let length = 1;

    const startRoom = this.roomsManager.getRandomRoomOfType(RoomType.START);
    const startNode: RoomNode = {
      index: 0,
      type: RoomType.START,
      roomTemplate: startRoom,
      next: null,
      step: CriticalPathStep.RIGHT,
    };

    let previousNode: RoomNode = startNode;
    while (length < targetLength) {
      const previousStep = previousNode.step;
      const step = this.getRandomStep();
      let roomType: RoomType;

      if (
        previousStep === CriticalPathStep.UP &&
        step === CriticalPathStep.RIGHT
      ) {
        roomType = RoomType.DOWN_TO_RIGHT_CORNER;
      } else if (
        previousStep === CriticalPathStep.RIGHT &&
        step === CriticalPathStep.UP
      ) {
        roomType = RoomType.RIGHT_TO_TOP_CORNER;
      } else {
        roomType =
          step === CriticalPathStep.UP ? RoomType.COLUMN : RoomType.HALLWAY;
      }

      const roomTemplate = this.roomsManager.getRandomRoomOfType(roomType);
      const node: RoomNode = {
        index: length,
        type: roomType,
        next: null,
        roomTemplate: roomTemplate,
        step,
      };

      previousNode.next = node;
      previousNode = node;
      length++;
    }

    return startNode;
  }

  private getRandomStep() {
    const rand = Math.round(Math.random() * 3 + 1);

    if (rand === 3) {
      return CriticalPathStep.UP;
    }

    return CriticalPathStep.RIGHT;
  }
}

export { LevelLayoutGenerator };
