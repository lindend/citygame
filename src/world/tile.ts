type Road = {
  type: "road";
  level: number;
};
type House = {
  type: "house";
  level: number;
};
type Empty = {
  type: "empty";
};
type TileSide = Road | House | Empty;

let tileIndex = 0;

export class Tile {
  sides: TileSide[];
  id: string;
  constructor() {
    this.id = "tile" + tileIndex++;
    this.sides = [];
  }
}
