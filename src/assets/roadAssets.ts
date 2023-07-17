import { Scene } from "@babylonjs/core/scene";
import { loadAssets } from "./loadAssets";

const assetRoot = "./assets/city/roads/";
const assets = {
  straight: "road_straight.glb",
  bend: "road_bend.glb",
  bendSidewalk: "road_bendSidewalk.glb",
  intersection3: "road_intersection.glb",
  intersection4: "road_crossroad.glb",
};

export function loadRoadAssets(scene: Scene, root: string = assetRoot) {
  return loadAssets(root, assets, scene);
}
