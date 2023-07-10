import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF/2.0";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  Vector4,
  HemisphericLight,
  MeshBuilder,
  SceneLoader,
} from "@babylonjs/core";

class App {
  scene: Scene;
  engine: Engine;

  constructor() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);

    let camera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl(canvas, true);
    new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (this.scene.debugLayer.isVisible()) {
          this.scene.debugLayer.hide();
        } else {
          this.scene.debugLayer.show();
        }
      }
    });

    // run the main render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  async loadScene() {}
}
const app = new App();
app.loadScene();
