import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Tile } from "./tile";
import { Chunk, TileMeshAssignment } from "../tileRenderer/chunk";
import { Graph } from "../graph/Graph";

const neighbourOffsets = [
  new Vector2(0, 1),
  new Vector2(1, 0),
  new Vector2(0, -1),
  new Vector2(-1, 0),
];

export type TileRotation = 0 | 1 | 2 | 3;

type PlacedTile = {
  tile: Tile;
  position: Vector2;
  rotation: TileRotation;
  meshes: TileMeshAssignment[];
};

function getTileSideFromOffset(offset: Vector2): number {
  if (offset.x > 0.99) {
    return 1;
  }
  if (offset.x < -0.99) {
    return 3;
  }

  if (offset.y < -0.99) {
    return 2;
  }

  return 0;
}

function rotateSide(side: number, rotation: number) {
  return (side - rotation + 4) % 4;
}

export class World {
  tiles: { [position: string]: PlacedTile };
  renderer: Chunk;
  roads: Graph<Tile>;
  unconnectedRoads: Vector2[];

  constructor(renderer: Chunk) {
    this.tiles = {};
    this.renderer = renderer;
    this.roads = new Graph();
    this.unconnectedRoads = [];
  }

  canPlace(tile: Tile, position: Vector2, rotation: TileRotation): boolean {
    const neighbours = this.neighbours(position);

    return this._canPlace(tile, position, rotation, neighbours);
  }

  private _canPlace(
    tile: Tile,
    position: Vector2,
    rotation: TileRotation,
    neighbours: PlacedTile[]
  ) {
    if (this.tiles[position.toString()]) {
      return false;
    }

    let hasRoadNeighbour = false;

    for (let neighbour of neighbours) {
      const offset = neighbour.position.subtract(position);
      if (offset.lengthSquared() > 1.0) {
        throw new Error("Invalid offset from tile neighbour");
      }

      const offsetTileSide = getTileSideFromOffset(offset);
      const sideIdx = rotateSide(offsetTileSide, rotation);
      const oppositeSideIdx = rotateSide(
        offsetTileSide + 2,
        neighbour.rotation
      );

      const side = tile.sides[sideIdx];
      const oppositeSide = neighbour.tile.sides[oppositeSideIdx];

      if (side.type == "road" || oppositeSide.type == "road") {
        if (side.type != oppositeSide.type) {
          return false;
        }
        hasRoadNeighbour = true;
      }
    }

    return hasRoadNeighbour;
  }

  place(
    tile: Tile,
    position: Vector2,
    rotation: TileRotation,
    force: boolean
  ): boolean {
    const neighbours = this.neighbours(position);

    if (!force && !this._canPlace(tile, position, rotation, neighbours)) {
      return false;
    }

    const meshes = this.renderer.addTile(
      tile,
      new Vector3(position.x * 2, 0, position.y * 2),
      rotation
    );

    // Remove unconnected road for current tile
    const unconnectedIdx = this.unconnectedRoads.findIndex((v) =>
      v.equalsWithEpsilon(position, 0.001)
    );
    if (unconnectedIdx >= 0) {
      this.unconnectedRoads.splice(unconnectedIdx, 1);
    }

    // Add any potentially new unconnected roads for the tile
    for (let i = 0; i < tile.sides.length; ++i) {
      if (tile.sides[rotateSide(i, rotation)].type == "road") {
        const offsetPosition = position.add(neighbourOffsets[i]);
        if (!this.getTile(offsetPosition)) {
          this.unconnectedRoads.push(offsetPosition);
        }
      }
    }

    let placedTile = {
      tile,
      position,
      rotation,
      meshes,
    };

    this.tiles[position.toString()] = placedTile;

    return true;
  }

  neighbours(position: Vector2): PlacedTile[] {
    return neighbourOffsets
      .map((o) => this.getTile(position.add(o)))
      .filter((t): t is PlacedTile => !!t);
  }

  getTile(position: Vector2): PlacedTile | null {
    const pStr = position.toString();
    return this.tiles[pStr];
  }

  getUnconnectedRoads(): Vector2[] {
    return this.unconnectedRoads;
  }
}
