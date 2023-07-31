import { LoadedAssets } from "../assets/loadAssets";
import { loadRoadAssets } from "../assets/roadAssets";
import { loadSuburbanAssets } from "../assets/suburbanAssets";
import { loadCommercialAssets } from "../assets/commercialAssets";
import { Scene } from "@babylonjs/core/scene";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Materials } from "../materials";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { InputManager } from "../input/inputManager";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { IGameState } from "./gameState";
import { Sky } from "../environment/sky";
import { Time } from "../environment/time";

export type Game = {
  scene: Scene;
  camera: ArcRotateCamera;
  shadows?: ShadowGenerator;
  input: InputManager;
  materials: Materials;
  ground: Mesh;
  sky: Sky;
  state: IGameState;
  sunLight: DirectionalLight;
  ambientLight: HemisphericLight;
  time: Time;
  assets: {
    roads: LoadedAssets<typeof loadRoadAssets>;
    suburban: LoadedAssets<typeof loadSuburbanAssets>;
    commercial: LoadedAssets<typeof loadCommercialAssets>;
  };
};

export function update(game: Game, delta: number) {
  game.time.update(delta);
  game.state.update(delta);

  game.scene.clearColor = game.sky.getSkyColor();
  game.scene.fogColor = game.sky.getFogColor();
}
