import { Scene } from "@babylonjs/core/scene";
import { asset, loadAssets } from "./loadAssets";

const assetRoot = "./assets/city/suburban/";
const assets = {
  house01: asset("house_type01.glb"),
  house02: asset("house_type02.glb"),
  house05: asset("house_type05.glb"),
  tree_large: asset("tree_large.glb"),
  tree_small: asset("tree_small.glb"),
  driveway: asset("driveway_short.glb"),
  path: asset("path_short.glb"),
};

export function loadSuburbanAssets(scene: Scene, root: string = assetRoot) {
  return loadAssets(root, assets, scene);
}
