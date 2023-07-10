import "@babylonjs/loaders/glTF/2.0";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  Vector4,
  HemisphericLight,
  MeshBuilder,
  SceneLoader,
  Mesh,
} from "@babylonjs/core";
import earcut from "earcut";
import { Tile } from "./world/tile";

function createBaseTile(name: string, scene: Scene) {
  // const numberOfSides = 4;
  // const radius = 1;
  // const points = [];
  // const angle = 2 * Math.PI;
  // for (let side = 0; side < numberOfSides; side++) {
  //   const sideAngle = (side * angle) / numberOfSides;
  //   points.push(
  //     new Vector3(radius * Math.cos(sideAngle), 0, radius * Math.sin(sideAngle))
  //   );
  // }
  const points = [
    new Vector3(-1, 0, 1),
    new Vector3(-1, 0, -1),
    new Vector3(1, 0, -1),
    new Vector3(1, 0, 1),
  ];

  //polygon1 texture per side
  return MeshBuilder.ExtrudePolygon(
    name,
    { shape: points, depth: 0.1 },
    scene,
    earcut
  );
}

async function addHouse(tile: Mesh, scene: Scene) {
  const house = await SceneLoader.LoadAssetContainerAsync(
    "./",
    "assets/city/houses/house_type02.glb",
    scene
  );
  house.meshes[0].parent = tile;
  scene.addMesh(house.meshes[0], true);
  // house.addAllToScene();
}

export function build(tile: Tile, scene: Scene) {
  const base = createBaseTile(tile.id, scene);
}
