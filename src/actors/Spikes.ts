import { TILE_SIZE } from '../game';
import { Player } from './Player';
import {
  RoomObject,
  ObjectPlacement,
  RoomObjectPropertyName,
  RoomObjectProperty,
} from '../types/map';

abstract class Obstacle extends Phaser.GameObjects.Sprite {
  abstract onPlayerCollision(player: Player): void;
}

class Spike extends Obstacle {
  private readonly COLLIDER_HEIGHT = 5;

  private readonly COLLIDER_WIDTH = TILE_SIZE;

  constructor(object: RoomObject, scene: Phaser.Scene, x: number, y: number) {
    super(scene, x + TILE_SIZE / 2, y + TILE_SIZE / 2, 'spikes');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    const placement = this.getPlacement(object);
    const rotation = this.getRotation(placement);
    this.rotation = Phaser.Math.DegToRad(rotation);

    this.setBodyShape(placement);
    this.body.setImmovable(true);
    this.body.allowGravity = false;
  }

  private getPlacement(object: RoomObject): ObjectPlacement {
    if (!object.properties) {
      return ObjectPlacement.BOTTOM;
    }
    const placement = object.properties.find(
      (prop: RoomObjectProperty) =>
        prop.name === RoomObjectPropertyName.PLACEMENT
    );
    if (!placement) {
      return ObjectPlacement.BOTTOM;
    }

    return placement.value as ObjectPlacement;
  }

  private setBodyShape(placement: ObjectPlacement): void {
    switch (placement) {
      case ObjectPlacement.TOP:
        this.body.setSize(this.COLLIDER_WIDTH, this.COLLIDER_HEIGHT);
        this.body.setOffset(0, 0);
        break;
      case ObjectPlacement.RIGHT:
        this.body.setSize(this.COLLIDER_HEIGHT, this.COLLIDER_WIDTH);
        this.body.setOffset(TILE_SIZE - this.COLLIDER_HEIGHT, 0);
        break;
      case ObjectPlacement.LEFT:
        this.body.setSize(this.COLLIDER_HEIGHT, this.COLLIDER_WIDTH);
        this.body.setOffset(0, 0);
        break;
      default:
        this.body.setSize(this.COLLIDER_WIDTH, this.COLLIDER_HEIGHT);
        this.body.setOffset(0, TILE_SIZE - this.COLLIDER_HEIGHT);
        break;
    }
  }

  private getRotation(placement: ObjectPlacement): number {
    switch (placement) {
      case ObjectPlacement.TOP:
        return 180;
      case ObjectPlacement.RIGHT:
        return 270;
      case ObjectPlacement.LEFT:
        return 90;
      default:
        return 0;
    }
  }

  onPlayerCollision(player: Player): void {
    console.log('Player hit spikes!', player);
    player.takeHit();
  }
}

export { Spike, Obstacle };
