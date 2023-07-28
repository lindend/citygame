import { Scene } from "@babylonjs/core/scene";
import { AssetPalette, asset, loadAssets } from "./loadAssets";
import { Color3 } from "@babylonjs/core/Maths/math.color";

// Small building palette
function sb(
  walls: Color3,
  border: Color3,
  windows: Color3,
  bottomFloor: Color3,
  roof: Color3
): AssetPalette {
  return {
    _defaultMat: walls,
    border,
    window: windows,
    door: bottomFloor,
    roof,
  };
}

const assetRoot = "./assets/city/commercial/";
const assets = {
  small_buildingA: asset("small_buildingA.glb"),
  small_buildingB: asset("small_buildingB.glb"),
  small_buildingC: asset("small_buildingC.glb"),
  small_buildingD: asset("small_buildingD.glb"),
  small_buildingE: asset("small_buildingE.glb"),
  small_buildingF: asset("small_buildingF.glb"),
  skyscraperF: asset("skyscraperF.glb"),
};

export function loadCommercialAssets(scene: Scene, root: string = assetRoot) {
  return loadAssets(root, assets, scene);
}
