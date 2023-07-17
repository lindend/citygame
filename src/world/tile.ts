export type Road = {
  type: "road";
  level: number;
  id: number;
};
export type Suburban = {
  type: "suburban";
  level: number;
};
export type Commercial = {
  type: "commercial";
  level: number;
};
export type Empty = {
  type: "empty";
};
export type TileSideType = Road | Suburban | Commercial | Empty;

export function RoadSide(id: number, level: number): Road {
  return {
    type: "road",
    id,
    level,
  };
}

export function EmptySide(): Empty {
  return {
    type: "empty",
  };
}

export function CommercialSide(level: number): Commercial {
  return {
    type: "commercial",
    level,
  };
}

export function SuburbanSide(level: number): Suburban {
  return {
    type: "suburban",
    level,
  };
}

let tileIndex = 0;

export type TileSide = 0 | 1 | 2 | 3;

export class Tile {
  id: string;
  sides: TileSideType[];

  constructor(sides: TileSideType[]) {
    this.id = "tile" + tileIndex++;
    this.sides = sides;
  }
}
