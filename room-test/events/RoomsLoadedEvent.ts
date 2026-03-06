class RoomsLoadedEvent extends Event {
  rooms: string[];

  constructor(rooms: string[]) {
    super('roomsLoaded');
    this.rooms = rooms;
  }
}

export { RoomsLoadedEvent };
