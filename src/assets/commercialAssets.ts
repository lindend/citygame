import { Scene } from "@babylonjs/core/scene";
import { asset, loadAssets } from "./loadAssets";

const assetRoot = "./assets/city/commercial/";
const assets = {
  small_buildingA: asset("small_buildingA.glb"),
  small_buildingB: asset("small_buildingB.glb"),
  small_buildingC: asset("small_buildingC.glb"),
  small_buildingD: asset("small_buildingD.glb"),
  small_buildingE: asset("small_buildingE.glb"),
  small_buildingF: asset("small_buildingF.glb"),
};

export function loadCommercialAssets(scene: Scene, root: string = assetRoot) {
  return loadAssets(root, assets, scene);
}
