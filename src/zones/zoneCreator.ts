import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Zone } from "./zone";
import { Game } from "../game";
import { buildingSize } from "../buildingConstants";

export function zoneDecoration(
  sideName: string,
  zone: Zone,
  game: Game
): TransformNode {
  const tfm = new TransformNode(sideName + "_decoration", game.scene);

  for (let { mesh, name, scale, position, rotation } of zone.items) {
    const model = mesh.instantiateModelsToScene();
    const buildingNode = new TransformNode(`${sideName}_${name}`, game.scene);
    buildingNode.parent = tfm;
    buildingNode.position = position;
    if (scale !== undefined) {
      buildingNode.scaling = scale;
    } else {
      buildingNode.scaling = buildingSize;
    }
    if (rotation !== undefined) {
      buildingNode.rotation = rotation;
    }
    model.rootNodes.forEach((r) => {
      r.parent = buildingNode;
    });
  }
  return tfm;
}
