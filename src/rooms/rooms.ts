import { RoomType } from '../types/rooms';

export const ROOMS: Record<RoomType, string[]> = {
  [RoomType.NON_CRITICAL]: ['non-critical/block.json'],
  [RoomType.START]: ['start/base_start.json'],
  [RoomType.HALLWAY]: ['hallway/hallway_1.json'],
  [RoomType.CROSS]: ['cross/cross.json'],
  [RoomType.INVERTED_T]: ['inverted-t/inverted_t.json'],
};
