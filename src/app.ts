// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF/2.0";
import { loadRoadAssets } from "./assets/roadAssets";
import { loadSuburbanAssets } from "./assets/suburbanAssets";
import { loadCommercialAssets } from "./assets/commercialAssets";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector2, Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { materials } from "./materials";
import { randomTile } from "./randomTile";
import { Chunk } from "./tileRenderer/chunk";
import { CascadedShadowGenerator } from "@babylonjs/core/Lights/Shadows/cascadedShadowGenerator";
import { TileRotation, World } from "./world/world";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { InputManager } from "./input/inputManager";
import { Game, update } from "./game/game";
import { PlayingGameState } from "./game/playingGameState";
import { EmptyGameState } from "./game/gameState";
import { Sky } from "./environment/sky";
import { Time } from "./environment/time";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Rendering/depthRendererSceneComponent";
import "@babylonjs/core/Culling/ray";

class App {
  engine: Engine;
  scene: Scene;
  camera: ArcRotateCamera;
  game?: Game;
  canvas: HTMLCanvasElement;

  constructor() {
    // create the canvas html element and attach it to the webpage
    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.id = "gameCanvas";
    document.body.appendChild(this.canvas);

    // initialize babylon scene and engine
    this.engine = new Engine(this.canvas, true, { stencil: true });
    const scene = new Scene(this.engine);
    // scene.performancePriority = ScenePerformancePriority.Aggressive;

    scene.autoClear = true;
    scene.autoClearDepthAndStencil = true;
    scene.clearColor = new Color4(0, 0, 0);
    scene.fogEnabled = true;
    scene.fogStart = 100;
    scene.fogEnd = 650;
    scene.fogMode = Scene.FOGMODE_LINEAR;
    scene.fogDensity = 0.01;
    scene.fogColor = Color3.White();

    this.camera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2 - 1.0,
      3,
      Vector3.Zero(),
      scene
    );

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
    // window.addEventListener("keydown", (ev) => {
    //   // Shift+Ctrl+Alt+I
    //   if (ev.code === "KeyI") {
    //     if (scene.debugLayer.isVisible()) {
    //       scene.debugLayer.hide();
    //     } else {
    //       scene.debugLayer.show();
    //     }
    //   }
    // });
    this.scene = scene;

    // run the main render loop
    this.engine.runRenderLoop(() => this.mainLoop());
  }

  mainLoop() {
    const delta = this.engine.getDeltaTime() / 1000;
    if (this.game) {
      update(this.game, delta);
    }
    this.scene.render();
    this.game?.input.update();
  }

  async loadScene() {
    const roadAssets = await loadRoadAssets(this.scene);
    const suburbanAssets = await loadSuburbanAssets(this.scene);
    const commercialAssets = await loadCommercialAssets(this.scene);
    const ambientLight = new HemisphericLight(
      "ambient_light",
      new Vector3(0, 1, 0),
      this.scene
    );
    ambientLight.diffuse = new Color3(0.15, 0.15, 0.25);
    ambientLight.groundColor = new Color3(0.15, 0.15, 0.25);
    const sunLight = new DirectionalLight(
      "sun",
      new Vector3(1, -1, 1),
      this.scene
    );
    sunLight.diffuse = new Color3(1, 1, 1);

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
        frontUVs: new Vector4(0, 0, 200, 200),
      },
      this.scene
    );
    ground.material = mats.ground;
    ground.position = new Vector3(0.0, -0.02, 0.0);
    ground.rotate(Vector3.RightReadOnly, Math.PI / 2);
    ground.receiveShadows = true;

    const input = new InputManager(this.canvas);

    const sky = new Sky();

    const game: Game = {
      scene: this.scene,
      camera: this.camera,
      shadows: shadows,
      materials: mats,
      ground: ground,
      sunLight,
      ambientLight,
      input,
      sky,
      time: new Time(),
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

    // world.place(
    //   new Tile([
    //     RoadSide(0, 0),
    //     CommercialSide(0),
    //     CommercialSide(0),
    //     RoadSide(0, 0),
    //   ]),
    //   Vector2.ZeroReadOnly,
    //   0,
    //   true
    // );

    world.place(randomTile(), Vector2.ZeroReadOnly, 0, true);

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
