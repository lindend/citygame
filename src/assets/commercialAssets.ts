import { Scene } from "@babylonjs/core/scene";
import { asset, loadAssets } from "./loadAssets";

const assetRoot = "./assets/city/commercial/";
const assets = {
  small_buildingC: asset("small_buildingC.glb"),
};

export function loadCommercialAssets(scene: Scene, root: string = assetRoot) {
  return loadAssets(root, assets, scene);
}
