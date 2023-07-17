import { Scene } from "@babylonjs/core/scene";
import { loadAssets } from "./loadAssets";

const assetRoot = "./assets/city/commercial/";
const assets = {
  small_buildingC: "small_buildingC.glb",
};

export function loadCommercialAssets(scene: Scene, root: string = assetRoot) {
  return loadAssets(root, assets, scene);
}
