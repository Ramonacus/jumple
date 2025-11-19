export type Layer = {
  data: number[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  objects?: RoomObject[];
};

export type Tileset = {
  columns: number;
  firstgid: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  objectalignment: string;
  spacing: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
};

export type RoomTilemap = {
  compressionlevel: number;
  height: number;
  infinite: boolean;
  layers: Layer[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tiledversion: string;
  tileheight: number;
  tilesets: Tileset[];
  tilewidth: number;
  type: string;
  version: string;
  width: number;
};

export type RoomObject = {
  height: number;
  id: number;
  name: string;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  properties?: [];
};

export type RoomObjectProperty = {
  name: string;
  type: string;
  value: string;
};

export enum LayerType {
  TERRAIN = 'Terrain',
  OBJECTS = 'Objects',
  OBSTACLES = 'Obstacles',
}

export enum ObjectType {
  SPAWN = 'Spawn',
}

export enum ObstacleType {
  SPIKES = 'Spikes',
}

export enum RoomObjectPropertyName {
  PLACEMENT = 'Placement',
}

export enum ObjectPlacement {
  TOP = 'Top',
  BOTTOM = 'Bottom',
  LEFT = 'Left',
  RIGHT = 'Right',
}
