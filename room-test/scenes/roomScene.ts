import { LevelScene } from '../../src/scenes/levelScene';

class RoomScene extends LevelScene {
  startLevel(): void {
    return;
  }

  spawnPlayer(x: number, y: number): void {
    this.player.spawn(x, y);
    this.setPlayerCollisions();
    this.camera.startFollow(this.player);
  }
}

export { RoomScene };
