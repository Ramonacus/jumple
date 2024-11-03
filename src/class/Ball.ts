import { EngineObject, vec2, Vector2 } from 'littlejsengine';
import { bounce } from '../effects/sound';
import { Player } from './Player';

class Ball extends EngineObject {
  constructor(pos: Vector2) {
    super(pos, vec2(0.5));
    this.velocity = vec2(-0.1, -0.1);
    this.setCollision();
    this.elasticity = 1;
  }

  collideWithObject(obj: EngineObject): boolean {
    const isPaddleCollision = obj instanceof Player;

    if (isPaddleCollision && this.velocity.y > 0) {
      return false;
    }

    bounce.play(this.pos, 1, this.velocity.length());

    if (isPaddleCollision) {
      const deltaX = this.pos.x - obj.pos.x;
      this.velocity = this.velocity.rotate(0.3 * deltaX);
      this.velocity.y = Math.max(-this.velocity.y, 0.2);
      this.velocity = this.velocity.normalize(
        Math.min(1.04 * this.velocity.length(), 0.5)
      );
      return false;
    }

    return true;
  }
}
export { Ball };
