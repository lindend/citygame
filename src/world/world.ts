import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { Tile } from "./tile";

const neighbourOffsets = [
  new Vector2(1, 0),
  new Vector2(1, 1),
  new Vector2(-1, 1),
  new Vector2(-1, -1),
];

class World {
  tiles: { [position: string]: Tile };
  constructor() {
    this.tiles = {};
  }
  canPlace(tile: Tile, position: Vector2): boolean {
    return true;
  }

  place(tile: Tile, position: Vector2) {
    const neighbours = this.neighbours(position);
  }
  neighbours(position: Vector2): Tile[] {
    return neighbourOffsets
      .map((o) => this.getTile(position.add(o)))
      .filter((t): t is Tile => !!t);
  }
  getTile(position: Vector2): Tile | null {
    const pStr = position.toString();
    return this.tiles[pStr];
  }
}
