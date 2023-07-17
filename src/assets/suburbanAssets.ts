import { Scene } from "@babylonjs/core/scene";
import { loadAssets } from "./loadAssets";

const assetRoot = "./assets/city/suburban/";
const assets = {
  house01: "house_type01.glb",
  house02: "house_type02.glb",
  house05: "house_type05.glb",
  tree_large: "tree_large.glb",
  tree_small: "tree_small.glb",
  driveway: "driveway_short.glb",
  path: "path_short.glb",
};

export function loadSuburbanAssets(scene: Scene, root: string = assetRoot) {
  return loadAssets(root, assets, scene);
}
