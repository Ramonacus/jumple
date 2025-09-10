import Phaser from 'phaser';
import { Level } from './Level';

enum CriticalPathStep {
  RIGHT,
  LEFT,
  UP,
}

class LevelGenerator {
  constructor(
    private roomWidth: number,
    private roomHeight: number,
    private levelWidth: number,
    private levelHeight: number
  ) {
    if (this.levelWidth <= 0 || this.levelHeight < 0) {
      throw new Error('Invalid layout size.');
    }
  }

  public createLevel(scene: Phaser.Scene): Level {
    const roomsLayout = this.generateLevelLayout();
    return new Level(
      scene,
      roomsLayout,
      this.roomWidth / 8,
      this.roomHeight / 8
    );
  }

  // Generate critical path
  private generateLevelLayout() {
    const layout: number[][] = [];
    let currentRow = 0;
    let currentColumn = 0;

    layout.push(Array(this.levelWidth).fill(0));
    layout[currentRow][currentColumn] = 1;

    while (layout.length < this.levelHeight) {
      const movement = this.getRandomStep();

      if (movement === CriticalPathStep.UP) {
        layout.push(Array(this.levelWidth).fill(0));
        currentRow += 1;
      } else {
        const direction = movement === CriticalPathStep.LEFT ? -1 : 1;
        currentColumn += direction;

        if (
          (movement === CriticalPathStep.LEFT && currentColumn === 0) ||
          (movement === CriticalPathStep.RIGHT &&
            currentColumn === this.levelWidth - 1)
        ) {
          layout[currentRow][currentColumn] = 1;
          layout.push(Array(this.levelWidth).fill(0));
          currentRow += 1;
        }
      }

      layout[currentRow][currentColumn] = 1;
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
