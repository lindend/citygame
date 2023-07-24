import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF/2.0";
import { loadRoadAssets } from "./assets/roadAssets";
import { Game } from "./game";
import { loadSuburbanAssets } from "./assets/suburbanAssets";
import { loadCommercialAssets } from "./assets/commercialAssets";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene, ScenePerformancePriority } from "@babylonjs/core/scene";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SSAORenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/ssaoRenderingPipeline";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { materials } from "./materials";
import { randomTile } from "./randomTile";
import { Chunk } from "./tileRenderer/chunk";
import { CommercialSide, RoadSide, SuburbanSide, Tile } from "./world/tile";

class App {
  engine: Engine;
  scene: Scene;
  camera: Camera;

  constructor() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    this.engine = new Engine(canvas, true, {});
    const scene = new Scene(this.engine);
    scene.performancePriority = ScenePerformancePriority.Aggressive;

    this.camera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2 - 1.0,
      30,
      Vector3.Zero(),
      scene
    );
    this.camera.attachControl(canvas, true);

    // var ssaoRatio = {
    //   ssaoRatio: 1.0, // Ratio of the SSAO post-process, in a lower resolution
    //   combineRatio: 1.0, // Ratio of the combine post-process (combines the SSAO and the scene)
    // };

    // var ssao = new SSAORenderingPipeline("ssao", scene, ssaoRatio);
    // ssao.fallOff = 0.000007;
    // ssao.area = 0.0001;
    // ssao.radius = 0.000005;
    // ssao.totalStrength = 1.5;
    // ssao.base = 0.4;

    // // Attach camera to the SSAO render pipeline
    // scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(
    //   "ssao",
    //   this.camera
    // );

    // scene.postProcessRenderPipelineManager.disableEffectInPipeline(
    //   "ssao",
    //   ssao.SSAOCombineRenderEffect,
    //   this.camera
    // );

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.code === "KeyI") {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // run the main render loop
    this.engine.runRenderLoop(() => {
      scene.render();
    });
    this.scene = scene;
  }

  async loadScene() {
    const roadAssets = await loadRoadAssets(this.scene);
    const suburbanAssets = await loadSuburbanAssets(this.scene);
    const commercialAssets = await loadCommercialAssets(this.scene);
    const ambientLight = new HemisphericLight(
      "ambient_light",
      new Vector3(1, -1, 1),
      this.scene
    );
    ambientLight.diffuse = new Color3(0.2, 0.2, 0.2);
    const sunLight = new DirectionalLight(
      "sun",
      new Vector3(1, -1, 1),
      this.scene
    );
    sunLight.diffuse = new Color3(1.5, 1.5, 1.5);
    const game: Game = {
      scene: this.scene,
      shadows: new ShadowGenerator(1024, sunLight, undefined, this.camera),
      materials: materials(this.scene),
      assets: {
        roads: roadAssets,
        suburban: suburbanAssets,
        commercial: commercialAssets,
      },
    };

    const chunk = new Chunk("testchunk", game);

    for (let x = 0; x < 5; ++x) {
      for (let y = 0; y < 5; ++y) {
        // const tile = new Tile([
        //   RoadSide(0, 0),
        //   SuburbanSide(0),
        //   CommercialSide(0),
        //   // RoadSide(0, 0),
        //   // RoadSide(0, 0),
        //   RoadSide(0, 0),
        // ]);
        const tile = randomTile();
        const position = new Vector3(x * 2, 0, y * 2);
        chunk.addTile(tile, position);
      }
    }

    chunk.build();

    // const inst = game.assets.roads.straight.asset.instantiateModelsToScene();
    // inst.rootNodes.forEach((r) =>
    //   r
    //     .getChildMeshes<Mesh>()
    //     .forEach((g) => g.rotate(Vector3.UpReadOnly, Math.PI / 2))
    // );
    // const { min, max } = inst.rootNodes[0].getHierarchyBoundingVectors(true);
    // console.log(min);
    // console.log(max);
  }
}
const app = new App();
app.loadScene();
