import {
  EngineObject,
  ParticleEmitter,
  randColor,
  vec2,
  Vector2,
} from 'littlejsengine';

import { world } from '../constant/world';
import { smash } from '../effects/sound';

class Brick extends EngineObject {
  static SIZE = vec2(2, 1);

  constructor(pos: Vector2) {
    super(pos, Brick.SIZE);
    this.color = randColor();
    this.setCollision();
    this.mass = 0;
  }

  collideWithObject(_o: EngineObject) {
    this.destroy();
    world.score++;
    smash.play(this.pos);
    const color = this.color;
    new ParticleEmitter(
      this.pos,
      0,
      this.size,
      0.1,
      200,
      Math.PI,
      undefined,
      color,
      color,
      color.scale(1, 0),
      color.scale(1, 0),
      0.2,
      0.5,
      1,
      0.1,
      0.1,
      0.99,
      0.95,
      0.4,
      Math.PI,
      0.1,
      0.5,
      false,
      true
    );

    return true;
  }
}

export { Brick };
