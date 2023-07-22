import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ZoneSize } from "../zones/zone";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

import earcut from "earcut";

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
export function createBaseTile(name: string, scene: Scene) {
  return MeshBuilder.ExtrudePolygon(
    name,
    { shape: baseTilePoints, depth: 0.1 },
    scene,
    earcut
  );
}
