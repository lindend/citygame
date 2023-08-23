import "@babylonjs/loaders/glTF/2.0";
import { Game } from "../game/game";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { LoadedAsset } from "../assets/loadAssets";
import { zoneFactory } from "../zones/zoneFactory";
import { ZoneSize } from "../zones/zone";
import { Tile, TileSideType } from "../world/tile";

export type TileAsset = {
  asset: LoadedAsset;
  inverted: boolean;
  transform: Matrix;
};

const straightRoadScale = new Vector3(0.75, 0.5, 0.5);
const straightRoadRotation = Quaternion.FromEulerVector(
  Vector3.UpReadOnly.scale(Math.PI / 2)
);
const straightRoadPosition = new Vector3(0, 0, 0.625);

function tileAsset(
  asset: LoadedAsset,
  transform: Matrix,
  inverted: boolean
): TileAsset {
  const c = asset.center;
  const center = Matrix.Translation(c.x, c.y, c.z);
  return {
    asset,
    transform: center.multiply(transform),
    inverted,
  };
}

function getStraightRoad(game: Game): TileAsset[] {
  const roadModel = game.assets.roads.straight;
  return [
    tileAsset(
      roadModel,
      Matrix.Compose(
        straightRoadScale,
        straightRoadRotation,
        straightRoadPosition
      ),
      false
    ),
  ];
}

const centerRoadScale = new Vector3(0.5, 0.5, 0.5);

function getCenterRoad(asset: LoadedAsset, rotation: Quaternion): TileAsset[] {
  return [
    tileAsset(
      asset,
      Matrix.Compose(centerRoadScale, rotation, Vector3.ZeroReadOnly),
      false
    ),
  ];
}

function isRoad(side: TileSideType): boolean {
  return side.type == "road";
}

type TileSideSize = {
  size: ZoneSize;
  orientation?: "left" | "right";
};

function getTileSideSize(tile: Tile, sideIndex: number): TileSideSize {
  const left = (tile.sides.length + sideIndex - 1) % tile.sides.length;
  const right = (sideIndex + 1) % tile.sides.length;
  if (isRoad(tile.sides[left]) && isRoad(tile.sides[right])) {
    return { size: "large" };
  } else if (isRoad(tile.sides[left])) {
    return { size: "medium", orientation: "right" };
  } else if (isRoad(tile.sides[right])) {
    return { size: "medium", orientation: "left" };
  }
  return { size: "small" };
}

const defaultScale = new Vector3(0.5, 0.5, 0.5);

function createTileSide(
  tile: Tile,
  side: TileSideType,
  sideIndex: number,
  game: Game
): TileAsset[] {
  if (side.type == "road") {
    return getStraightRoad(game);
  } else if (side.type == "empty") {
    return [];
  } else {
    const size = getTileSideSize(tile, sideIndex);

    let scaling = Matrix.IdentityReadOnly;
    let inverted = false;
    // Mirror right-sided tiles
    if (size.orientation == "left") {
      scaling = Matrix.Scaling(-1, 1, 1);
      inverted = true;
    }

    const sideFactory = zoneFactory[side.type][size.size];
    const rng = Math.floor(Math.random() * sideFactory.length);
    const sideItems = sideFactory[rng](game);
    return sideItems.items.map((item) => {
      return tileAsset(
        item.mesh,
        Matrix.Compose(
          item.scale || defaultScale,
          Quaternion.FromEulerVector(item.rotation || Vector3.ZeroReadOnly),
          item.position
        ).multiply(scaling),
        inverted
      );
    });
  }
}
function numRoads(tile: Tile): number {
  let numRoads = 0;
  for (let i = 0; i < tile.sides.length; ++i) {
    if (tile.sides[i].type == "road") {
      numRoads += 1;
    }
  }
  return numRoads;
}
function lastRoad(tile: Tile): number {
  let num = numRoads(tile);
  if (num == 0 || num == tile.sides.length) {
    return 0;
  }

  for (let i = tile.sides.length - 1; i >= 0; --i) {
    if (tile.sides[i].type == "road") {
      let j = i + 1;
      while (tile.sides[j % tile.sides.length].type == "road") {
        j += 1;
      }
      return (j - 1) % tile.sides.length;
    }
  }
  return 0;
}

function isStraightRoad(tile: Tile): boolean {
  return (
    (isRoad(tile.sides[0]) && isRoad(tile.sides[2])) ||
    (isRoad(tile.sides[1]) && isRoad(tile.sides[3]))
  );
}

export function getTileAssets(tile: Tile, game: Game): TileAsset[] {
  let assets: TileAsset[] = [];
  for (let i = 0; i < tile.sides.length; ++i) {
    const side = tile.sides[i];
    const tileSideAssets = createTileSide(tile, side, i, game);
    const transformed = tileSideAssets.map(({ asset, transform, inverted }) => {
      return {
        asset,
        transform: transform.multiply(Matrix.RotationY(Math.PI * 0.5 * i)),
        inverted,
      };
    });
    assets.push(...transformed);
  }

  let num = numRoads(tile);
  if (num == 2) {
    const isStraight = isStraightRoad(tile);
    const model = isStraight
      ? game.assets.roads.straight
      : game.assets.roads.bendSidewalk;
    const rotation = isStraight ? 1 : 1;
    const center = getCenterRoad(
      model,
      Quaternion.FromEulerAngles(
        0,
        (Math.PI / 2) * (lastRoad(tile) + rotation),
        0
      )
    );
    assets.push(...center);
  } else if (num == 3) {
    const center = getCenterRoad(
      game.assets.roads.intersection3,
      Quaternion.FromEulerAngles(0, (Math.PI / 2) * (lastRoad(tile) + 1), 0)
    );
    assets.push(...center);
  } else if (num == 4) {
    const center = getCenterRoad(
      game.assets.roads.intersection4,
      Quaternion.Identity()
    );
    assets.push(...center);
  }
  return assets;
}
