export enum RoomType {
  NON_CRITICAL,
  START, // Start room, exits to right
  HALLWAY, // Exits to left/right
  CROSS, // Exits to left/right/down/top
  INVERTED_T, // Exits to left/right/up
}
