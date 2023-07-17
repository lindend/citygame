import "@babylonjs/loaders/glTF/2.0";
import earcut from "earcut";
import { Tile, TileSideType } from "./world/tile";
import { Game } from "./game";
import { zoneDecoration } from "./zones/zoneCreator";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Material } from "@babylonjs/core/Materials/material";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ZoneSize } from "./zones/zone";
import { zoneFactory } from "./zones/zoneFactory";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Node } from "@babylonjs/core/node";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";

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

function createZoneMesh(
  name: string,
  points: Vector3[],
  outlineMaterial: Material,
  fillMaterial: Material,
  scene: Scene
) {
  const outlinePoints = points.slice();
  outlinePoints.push(points[0]);
  const transform = new TransformNode(name, scene);
  transform.translate(Vector3.UpReadOnly, 0.001);
  const outline = MeshBuilder.CreateLines(
    name + "_outline",
    {
      points: outlinePoints,
      material: outlineMaterial,
    },
    scene
  );
  outline.overrideMaterialSideOrientation = VertexData.FRONTSIDE;
  outline.translate(Vector3.UpReadOnly, 0.001);
  outline.parent = transform;

  const fill = MeshBuilder.CreatePolygon(
    name + "_fill",
    {
      shape: points,
    },
    scene,
    earcut
  );
  fill.overrideMaterialSideOrientation = VertexData.FRONTSIDE;
  fill.material = fillMaterial;
  fill.parent = transform;

  return transform;
}

function addStraightRoad(name: string, game: Game) {
  const transform = new TransformNode(name, game.scene);
  const roadModel = game.assets.roads.straight.instantiateModelsToScene();
  const roadNode = new TransformNode(name + "_road", game.scene);
  roadNode.scaling = new Vector3(0.75, 0.5, 0.5);
  roadNode.position = new Vector3(-0.75 * 0.5, 0, 0.625);
  roadNode.rotation = Vector3.UpReadOnly.scale(Math.PI / 2);
  roadModel.rootNodes.forEach((r) => (r.parent = roadNode));
  roadNode.parent = transform;
  return transform;
}

function addCenterRoad(name: string, game: Game, model: AssetContainer) {
  const transform = new TransformNode(name, game.scene);
  const roadModel = model.instantiateModelsToScene();
  const roadNode = new TransformNode(name + "_road", game.scene);
  roadNode.scaling = new Vector3(0.5, 0.5, 0.5);
  roadNode.position = new Vector3(0, 0, -0.75 * 0.5);
  roadModel?.rootNodes.forEach((r) => (r.parent = roadNode));
  roadNode.parent = transform;
  return transform;
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
): TransformNode {
  const sideId = `${tile.id}_side_${sideIndex}`;
  if (side.type == "road") {
    return addStraightRoad(sideId, game);
  } else if (side.type == "empty") {
    return new TransformNode(sideId);
  } else {
    const size = getTileSideSize(tile, sideIndex);
    // const sideNode = createZoneMesh(
    //   sideId,
    //   tileZonePoints[size.size],
    //   game.materials[side.type].outline,
    //   game.materials[side.type].fill,
    //   game.scene
    // );

    const sideNode = new TransformNode(sideId, game.scene);

    // Mirror right-sided tiles
    if (size.orientation == "left") {
      sideNode.scaling = new Vector3(-1, 1, 1);
    }

    const sideFactory = zoneFactory[side.type][size.size];
    const rng = Math.floor(Math.random() * sideFactory.length);
    const decoration = zoneDecoration(sideId, sideFactory[rng](game), game);
    decoration.parent = sideNode;
    return sideNode;
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

export function createTileMesh(tile: Tile, game: Game): TransformNode {
  const root = new TransformNode(tile.id, game.scene);
  for (let i = 0; i < tile.sides.length; ++i) {
    const side = tile.sides[i];
    const sideNode = createTileSide(tile, side, i, game);
    sideNode.parent = root;
    sideNode.rotation = Vector3.UpReadOnly.scale((Math.PI / 2) * i);
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
