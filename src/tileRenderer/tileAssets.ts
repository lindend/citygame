import "@babylonjs/loaders/glTF/2.0";
import earcut from "earcut";
import { Game } from "./game";
import { Scene } from "@babylonjs/core/scene";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Material } from "@babylonjs/core/Materials/material";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Node } from "@babylonjs/core/node";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { LoadedAsset } from "../assets/loadAssets";
import { zoneFactory } from "../zones/zoneFactory";
import { ZoneSize } from "../zones/zone";
import { Tile, TileSideType } from "../world/tile";

const baseTilePoints = [
  new Vector3(-1, 0, 1),
  new Vector3(-1, 0, -1),
  new Vector3(1, 0, -1),
  new Vector3(1, 0, 1),
];

const tileZonePoints: { [key in ZoneSize]: Vector3[] } = {
  large: [
    new Vector3(-1, 0, 1),
    new Vector3(1, 0, 1),
    new Vector3(1, 0, 0.25),
    new Vector3(-1, 0, 0.25),
  ],
  medium: [
    new Vector3(-1, 0, 1),
    new Vector3(1, 0, 1),
    new Vector3(0.25, 0, 0.25),
    new Vector3(-1, 0, 0.25),
  ],
  small: [
    new Vector3(-1, 0, 1),
    new Vector3(1, 0, 1),
    new Vector3(0.25, 0, 0.25),
    new Vector3(-0.25, 0, 0.25),
  ],
};
function createBaseTile(name: string, scene: Scene) {
  return MeshBuilder.ExtrudePolygon(
    name,
    { shape: baseTilePoints, depth: 0.1 },
    scene,
    earcut
  );
}

export type TileAsset = {
  asset: LoadedAsset;
  transform: Matrix;
};

const straightRoadScale = new Vector3(0.75, 0.5, 0.5);
const straightRoadRotation = Quaternion.FromEulerVector(
  Vector3.UpReadOnly.scale(Math.PI / 2)
);
const straightRoadPosition = new Vector3(-0.75 * 0.5, 0, 0.625);
function getStraightRoad(game: Game): TileAsset[] {
  const roadModel = game.assets.roads.straight;
  return [
    {
      asset: roadModel,
      transform: Matrix.Compose(
        straightRoadScale,
        straightRoadRotation,
        straightRoadPosition
      ),
    },
  ];
}

const centerRoadScale = new Vector3(0.5, 0.5, 0.5);
const centerRoadPosition = new Vector3(0, 0, -0.75 * 0.5);

function getCenterRoad(asset: LoadedAsset): TileAsset[] {
  return [
    {
      asset,
      transform: Matrix.Compose(
        centerRoadScale,
        Quaternion.Identity(),
        centerRoadPosition
      ),
    },
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

    let scaling = Vector3.OneReadOnly;
    // Mirror right-sided tiles
    if (size.orientation == "left") {
      scaling = new Vector3(-1, 1, 1);
    }

    const sideFactory = zoneFactory[side.type][size.size];
    const rng = Math.floor(Math.random() * sideFactory.length);
    const sideItems = sideFactory[rng](game);
    return sideItems.items.map((item) => {
      return {
        asset: item.mesh,
        transform: Matrix.Compose(
          item.scale || Vector3.OneReadOnly,
          Quaternion.FromEulerVector(item.rotation || Vector3.UpReadOnly),
          item.position
        ),
      };
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
  const root = new TransformNode(tile.id, game.scene);
  for (let i = 0; i < tile.sides.length; ++i) {
    const side = tile.sides[i];
    const tileSideAssets = createTileSide(tile, side, i, game);
    tileSideAssets.forEach((a) => Matrix.RotationY(Math.PI * 0.5 * i));
  }

  const tileCenterId = `${tile.id}_center`;
  let num = numRoads(tile);
  if (num == 2) {
    const model = isStraightRoad(tile)
      ? game.assets.roads.straight
      : game.assets.roads.bendSidewalk;
    const center = addCenterRoad(tileCenterId, game, model);
    center.rotation = Vector3.UpReadOnly.scale(
      (Math.PI / 2) * (lastRoad(tile) + 1)
    );
    center.parent = root;
  } else if (num == 3) {
    const center = addCenterRoad(
      tileCenterId,
      game,
      game.assets.roads.intersection3
    );
    center.rotation = Vector3.UpReadOnly.scale(
      (Math.PI / 2) * (lastRoad(tile) + 1)
    );
    center.parent = root;
  } else if (num == 4) {
    const center = addCenterRoad(
      tileCenterId,
      game,
      game.assets.roads.intersection4
    );
    center.parent = root;
  }

  let meshes = root.getChildren<Mesh>(
    (n: Node): n is Mesh => (<Mesh>n).subMeshes !== undefined,
    false
  );
  let merged = Mesh.MergeMeshes(meshes, true, true, undefined, false, true)!;
  merged.isPickable = false;

  root.getChildren().forEach((c) => c.dispose());

  merged.parent = root;

  const base = createBaseTile(tile.id + "_base", game.scene);
  base.isPickable = false;
  base.parent = root;

  return root;

  // return base;
}
