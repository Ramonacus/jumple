import { Sound } from 'littlejsengine';

const bounce = new Sound(
  [, , 1e3, , 0.03, 0.02, 1, 2, , , 940, 0.03, , , , , 0.2, 0.6, , 0.06],
  0
);
const click = new Sound([1, 0.5]);
const smash = new Sound(
  [, , 90, , 0.01, 0.03, 4, , , , , , , 9, 50, 0.2, , 0.2, 0.01],
  0
);
const start = new Sound([
  ,
  0,
  500,
  ,
  0.04,
  0.3,
  1,
  2,
  ,
  ,
  570,
  0.02,
  0.02,
  ,
  ,
  ,
  0.04,
]);

export { bounce, click, smash, start };
