import { LoadedAssets } from "./assets/loadAssets";
import { loadRoadAssets } from "./assets/roadAssets";
import { loadSuburbanAssets } from "./assets/suburbanAssets";
import { loadCommercialAssets } from "./assets/commercialAssets";
import { Scene } from "@babylonjs/core/scene";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Materials } from "./materials";

export type Game = {
  scene: Scene;
  shadows: ShadowGenerator;
  materials: Materials;
  assets: {
    roads: LoadedAssets<typeof loadRoadAssets>;
    suburban: LoadedAssets<typeof loadSuburbanAssets>;
    commercial: LoadedAssets<typeof loadCommercialAssets>;
  };
};
