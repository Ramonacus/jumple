import Phaser from 'phaser';
import { Level } from './Level';
import { RoomType } from '../types/rooms';
import { RoomManager } from '../rooms/RoomsManager';

enum CriticalPathStep {
  RIGHT,
  LEFT,
  UP,
}

class LevelGenerator {
  constructor(
    private levelWidth: number,
    private levelHeight: number,
    private roomsManager: RoomManager
  ) {
    if (this.levelWidth <= 0 || this.levelHeight < 0) {
      throw new Error('Invalid layout size.');
    }
  }

  public createLevel(scene: Phaser.Scene): Level {
    const roomsLayout = this.generateLevelLayout();
    return new Level(scene, this.roomsManager, roomsLayout);
  }

  // Generate critical path
  private generateLevelLayout(): RoomType[][] {
    const layout: number[][] = [];
    let currentRow = this.levelHeight - 1;
    let currentColumn = 0;

    for (let i = 0; i < this.levelHeight; i++) {
      layout.push(Array(this.levelWidth).fill(RoomType.NON_CRITICAL));
    }

    layout[currentRow][currentColumn] = RoomType.START;
    currentColumn += 1;
    layout[currentRow][currentColumn] = RoomType.HALLWAY;

    while (currentRow !== 0) {
      const movement = this.getRandomStep();

      if (
        movement === CriticalPathStep.UP ||
        (movement === CriticalPathStep.LEFT && currentColumn === 0) ||
        (movement === CriticalPathStep.RIGHT &&
          currentColumn === this.levelWidth - 1)
      ) {
        layout[currentRow][currentColumn] = RoomType.CROSS;
        currentRow -= 1;
        layout[currentRow][currentColumn] = RoomType.INVERTED_T;
      } else {
        let direction = movement === CriticalPathStep.LEFT ? -1 : 1;

        if (
          layout[currentRow][currentColumn + direction] !==
          RoomType.NON_CRITICAL
        ) {
          direction = direction * -1;
        }

        currentColumn += direction;
        layout[currentRow][currentColumn] = RoomType.HALLWAY;
      }
    }

    return layout;
  }

  private getRandomStep() {
    const rand = Math.round(Math.random() * 5 + 1);

    if (rand === 5) {
      return CriticalPathStep.UP;
    }

    return rand <= 2 ? CriticalPathStep.LEFT : CriticalPathStep.RIGHT;
  }
}

export { LevelGenerator };
