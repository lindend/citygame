import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF/2.0";
import { loadRoadAssets } from "./assets/roadAssets";
import { EmptyGameState, Game, PlayingGameState, update } from "./game";
import { loadSuburbanAssets } from "./assets/suburbanAssets";
import { loadCommercialAssets } from "./assets/commercialAssets";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene, ScenePerformancePriority } from "@babylonjs/core/scene";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector2, Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { materials } from "./materials";
import { randomTile } from "./randomTile";
import { Chunk } from "./tileRenderer/chunk";
import { CascadedShadowGenerator } from "@babylonjs/core/Lights/Shadows/cascadedShadowGenerator";
import { SSAO2RenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/ssao2RenderingPipeline";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import mainMenu from "./gui/mainMenu.json";
import { TileRotation, World } from "./world/world";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

class App {
  engine: Engine;
  scene: Scene;
  camera: Camera;
  game?: Game;

  constructor() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    this.engine = new Engine(canvas, true, { stencil: true });
    const scene = new Scene(this.engine);
    scene.performancePriority = ScenePerformancePriority.Aggressive;

    scene.autoClear = true;
    scene.autoClearDepthAndStencil = true;
    scene.clearColor = new Color4(0.53, 0.81, 0.98, 1.0);
    scene.fogEnabled = true;
    scene.fogStart = 100;
    scene.fogEnd = 650;
    scene.fogMode = Scene.FOGMODE_LINEAR;
    scene.fogDensity = 0.01;
    scene.fogColor = new Color3(0.53, 0.81, 0.98);

    this.camera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2 - 1.0,
      3,
      Vector3.Zero(),
      scene
    );
    this.camera.attachControl(canvas, true);

    // var ssao = new SSAO2RenderingPipeline(
    //   "ssao",
    //   scene,
    //   0.5,
    //   [this.camera],
    //   true
    // );
    // ssao.radius = 0.5;
    // ssao.samples = 16;

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
    this.scene = scene;

    // run the main render loop
    this.engine.runRenderLoop(() => this.mainLoop());
  }

  mainLoop() {
    const delta = this.engine.getDeltaTime();
    if (this.game) {
      update(this.game, delta);
    }
    this.scene.render();
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
    ambientLight.diffuse = new Color3(0.3, 0.3, 0.5);
    const sunLight = new DirectionalLight(
      "sun",
      new Vector3(1, -1, 1),
      this.scene
    );
    sunLight.diffuse = new Color3(1.2, 1.2, 1.2);

    const shadows = new CascadedShadowGenerator(2048, sunLight);
    shadows.autoCalcDepthBounds = true;
    shadows.lambda = 1;
    shadows.bias = 0.0027;
    shadows.normalBias = 0;
    shadows.numCascades = 3;

    // let guiTexture = AdvancedDynamicTexture.CreateFullscreenUI(
    //   "MainMenu",
    //   true,
    //   this.scene
    // );
    // guiTexture.parseSerializedObject(mainMenu);
    // const playNow = guiTexture.getControlByName("Button");

    const mats = materials(this.scene);

    const ground = MeshBuilder.CreatePlane(
      "ground",
      {
        size: 0.1,
        width: 10000,
        height: 10000,
        sideOrientation: Mesh.DOUBLESIDE,
        frontUVs: new Vector4(0, 0, 1000, 1000),
      },
      this.scene
    );
    ground.material = mats.ground;
    ground.position = new Vector3(0.0, -0.02, 0.0);
    ground.rotate(Vector3.RightReadOnly, Math.PI / 2);
    ground.receiveShadows = true;

    const game: Game = {
      scene: this.scene,
      camera: this.camera,
      shadows: shadows,
      materials: mats,
      ground: ground,
      state: new EmptyGameState(),
      assets: {
        roads: roadAssets,
        suburban: suburbanAssets,
        commercial: commercialAssets,
      },
    };
    this.game = game;

    const chunk = new Chunk("testchunk", game);

    let world = new World(chunk);

    this.game.state = new PlayingGameState(this.game, world);

    let placeTile = (x: number, y: number) => {
      const tile = randomTile();
      const position = new Vector2(x, y);

      for (let i: TileRotation = 0; i < 4; ++i) {
        if (world.place(tile, position, i as TileRotation, false)) {
          return true;
        }
      }
      return false;
    };

    world.place(randomTile(), Vector2.ZeroReadOnly, 0, true);

    let newRandomTile = () => {
      while (true) {
        const unconnectedRoads = world.getUnconnectedRoads();
        const idx = Math.floor(Math.random() * unconnectedRoads.length);
        const ur = unconnectedRoads[idx];
        if (placeTile(ur.x, ur.y)) {
          break;
        }
      }
    };

    for (let x = 0; x < 10; ++x) {
      for (let y = 0; y < 10; ++y) {
        newRandomTile();
      }
    }

    chunk.build();

    // setInterval(() => {
    //   newRandomTile();
    //   chunk.build();
    // }, 200);
  }
}
const app = new App();
app.loadScene();
