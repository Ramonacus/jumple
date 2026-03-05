import { RoomTilemap } from './map';

export type RoomNode = {
  index: number;
  type: RoomType;
  next: RoomNode | null;
  step: CriticalPathStep | null;
  roomTemplate: RoomTilemap | null;
};

export enum CriticalPathStep {
  RIGHT,
  LEFT,
  UP,
}

export enum RoomType {
  START, // Start room, exits to right
  HALLWAY, // Exits to left/right
  COLUMN,
  RIGHT_TO_TOP_CORNER,
  DOWN_TO_RIGHT_CORNER,
}
