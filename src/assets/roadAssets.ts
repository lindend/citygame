import { Scene } from "@babylonjs/core/scene";
import { asset, loadAssets } from "./loadAssets";
import { Vector3 } from "@babylonjs/core";

const roadCenter = new Vector3(0, 0, -0.75);
const ra = (file: string) => asset(file, roadCenter);

const assetRoot = "./assets/city/roads/";
const assets = {
  straight: ra("road_straight.glb"),
  bend: ra("road_bend.glb"),
  bendSidewalk: ra("road_bendSidewalk.glb"),
  intersection3: ra("road_intersection.glb"),
  intersection4: ra("road_crossroad.glb"),
};

export function loadRoadAssets(scene: Scene, root: string = assetRoot) {
  return loadAssets(root, assets, scene);
}
