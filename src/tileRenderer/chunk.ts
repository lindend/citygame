import { Scene } from "@babylonjs/core/scene";
import { Tile } from "../world/tile";
import { Game } from "../game";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

export class Chunk {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  addTile(tile: Tile) {
    let g: Game;
    let test = g.assets.commercial.small_buildingC;
    const models = test.instantiateModelsToScene();
    const meshes = models.rootNodes.flatMap((r) => r.getChildren<Mesh>());
    meshes[0].thinInstanceAdd();
  }
}
