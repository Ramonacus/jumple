import {
  vec2,
  engineInit,
  setCameraPos,
  setCanvasFixedSize,
  drawRect,
  cameraPos,
  Color,
  drawTextScreen,
  mainCanvasSize,
  mouseWasPressed,
} from 'littlejsengine';

import { Brick } from './class/Brick';
import { Player } from './class/Player';
import { world } from './constant/world';
import { Ball } from './class/Ball';
import { Wall } from './class/Wall';
import { start } from './effects/sound';

const { levelSize } = world;

function gameInit() {
  setCameraPos(levelSize.scale(0.5));
  setCanvasFixedSize(vec2(1280, 720));

  for (let x = 2; x <= levelSize.x - 2; x += Brick.SIZE.x) {
    for (let y = 12; y <= levelSize.y - 2; y += Brick.SIZE.y) {
      new Brick(vec2(x, y));
    }
  }

  new Player();
  new Wall(vec2(-0.5, levelSize.y / 2), vec2(1, 100));
  new Wall(vec2(levelSize.x + 0.5, levelSize.y / 2), vec2(1, 100));
  new Wall(vec2(levelSize.x / 2, levelSize.y + 0.5), vec2(100, 1));
}

function gameUpdate() {
  const { ball } = world;
  if (ball && ball.pos.y < -1) {
    ball.destroy();
    world.ball = null;
  }
  if (!ball && mouseWasPressed(0)) {
    world.ball = new Ball(cameraPos);
    start.play();
  }
}

function gameUpdatePost() {}

function gameRender() {
  drawRect(cameraPos, vec2(100), new Color(0.5, 0.5, 0.5));
  drawRect(cameraPos, levelSize, new Color(0.1, 0.1, 0.1));
}

function gameRenderPost() {
  drawTextScreen('Score ' + world.score, vec2(mainCanvasSize.x / 2, 70), 50);
}

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
