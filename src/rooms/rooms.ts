import { RoomType } from '../types/rooms';

export const ROOMS: Record<RoomType, string[]> = {
  [RoomType.START]: ['start/base_start.json'],
  [RoomType.HALLWAY]: [
    'hallway/hallway_2.json',
    'hallway/hallway_3.json',
    'hallway/hallway_4.json',
  ],
  [RoomType.DOWN_TO_RIGHT_CORNER]: ['top_left_corner/c1.json'],
  [RoomType.RIGHT_TO_TOP_CORNER]: ['bottom_right_corner/c1.json'],
  [RoomType.COLUMN]: ['column/col1.json'],
};
