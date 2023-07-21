import { Scene } from "@babylonjs/core/scene";
import { asset, loadAssets } from "./loadAssets";

const assetRoot = "./assets/city/roads/";
const assets = {
  straight: asset("road_straight.glb"),
  bend: asset("road_bend.glb"),
  bendSidewalk: asset("road_bendSidewalk.glb"),
  intersection3: asset("road_intersection.glb"),
  intersection4: asset("road_crossroad.glb"),
};

export function loadRoadAssets(scene: Scene, root: string = assetRoot) {
  return loadAssets(root, assets, scene);
}
