import { vec2, Vector2 } from 'littlejsengine';
import { Ball } from '../class/Ball';

const world: { levelSize: Vector2; ball: Ball | null; score: number } = {
  levelSize: vec2(38, 20),
  ball: null,
  score: 0,
};

export { world };
