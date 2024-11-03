import { clamp, EngineObject, mousePos, vec2 } from 'littlejsengine';
import { world } from '../constant/world';

class Player extends EngineObject {
  constructor() {
    super(vec2(0, 1), vec2(6, 0.5));
    this.setCollision();
    this.mass = 0;
  }
  update() {
    this.pos.x = clamp(
      mousePos.x,
      this.size.x / 2,
      world.levelSize.x - this.size.x / 2
    );
  }
}

export { Player };
