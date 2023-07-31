import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { InputManager } from "./input/inputManager";
import { Matrix, Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";
import { lerp, progress } from "./math";

const scrollFactor = 0.03;
const scrollSmoothing = 0.1;
const minRadius = 5;
const moveSpeed = 2;
const turnSpeed = 2;
const minBeta = 1.2;
const minBetaHeight = minRadius;
const maxBeta = 0.6;
const maxBetaHeight = 30;

const turnLeftKeys = ["ArrowLeft", "q"];
const turnRightKeys = ["ArrowRight", "e"];
const moveForwardKeys = ["ArrowUp", "w"];
const moveBackKeys = ["ArrowDown", "s"];
const moveLeftKeys = ["a"];
const moveRightKeys = ["d"];

export class CameraController {
  private targetRadius: number;
  constructor(
    private camera: ArcRotateCamera,
    private inputManager: InputManager
  ) {
    this.targetRadius = camera.radius;
  }

  anyKeyDown(keys: string[]) {
    for (let key of keys) {
      if (this.inputManager.isKeyDown(key)) {
        return true;
      }
    }
    return false;
  }

  getCameraDirection(direction: Vector3) {
    const rotationMatrix = Matrix.RotationY(-this.camera.alpha - Math.PI / 2);
    return Vector4.TransformCoordinates(direction, rotationMatrix).toVector3();
  }

  getMoveSpeed(delta: number) {
    return moveSpeed * delta * Math.sqrt(this.camera.radius);
  }

  moveCameraTarget(direction: Vector3, speed: number) {
    this.camera.target.addInPlace(
      this.getCameraDirection(direction).multiply(new Vector3(speed, 0, speed))
    );
  }

  update(delta: number) {
    const scroll = this.inputManager.getScroll() * scrollFactor;
    if (this.targetRadius + scroll < minRadius) {
      this.targetRadius = minRadius;
    } else {
      this.targetRadius += scroll;
    }

    this.camera.radius =
      this.targetRadius * scrollSmoothing +
      this.camera.radius * (1 - scrollSmoothing);

    let betaSmooth = progress(this.camera.radius, minBetaHeight, maxBetaHeight);
    this.camera.beta = lerp(minBeta, maxBeta, betaSmooth);

    if (this.anyKeyDown(moveForwardKeys)) {
      const speed = this.getMoveSpeed(delta);
      this.moveCameraTarget(Vector3.Forward(), speed);
    }

    if (this.anyKeyDown(moveBackKeys)) {
      const speed = this.getMoveSpeed(delta);
      this.moveCameraTarget(Vector3.Backward(), speed);
    }

    if (this.anyKeyDown(moveLeftKeys)) {
      const speed = this.getMoveSpeed(delta);
      this.moveCameraTarget(Vector3.Left(), speed);
    }

    if (this.anyKeyDown(moveRightKeys)) {
      const speed = this.getMoveSpeed(delta);
      this.moveCameraTarget(Vector3.Right(), speed);
    }

    if (this.anyKeyDown(turnLeftKeys)) {
      const rotationSpeed = turnSpeed * delta;
      this.camera.alpha += rotationSpeed;
    }

    if (this.anyKeyDown(turnRightKeys)) {
      const rotationSpeed = turnSpeed * delta;
      this.camera.alpha -= rotationSpeed;
    }
  }
}
