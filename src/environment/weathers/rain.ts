import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Game } from "../../game/game";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { BoxParticleEmitter } from "@babylonjs/core/Particles/EmitterTypes/boxParticleEmitter";
import { Color4 } from "@babylonjs/core";
import { Cloudy } from "./cloudy";

export const LightRain = 200;
export const HeavyRain = 1500;
const rainParticleColor = 0.3;

export class Rain extends Cloudy {
  private rainParticleSystem: ParticleSystem;
  private emitter: BoxParticleEmitter;

  constructor(private rate: number, cloudCoverage: number, game: Game) {
    super(cloudCoverage, game);

    this.rainParticleSystem = new ParticleSystem(
      "weather_rain",
      10000,
      game.scene
    );
    this.rainParticleSystem.particleTexture = new Texture(
      "assets/textures/rain.jpg"
    );
    this.rainParticleSystem.billboardMode = ParticleSystem.BILLBOARDMODE_ALL;
    this.rainParticleSystem.isBillboardBased = true;
    this.rainParticleSystem.emitRate = rate;
    this.rainParticleSystem.minLifeTime = 1;
    this.rainParticleSystem.maxLifeTime = 1;
    this.rainParticleSystem.gravity = new Vector3(0, -20, 0);
    this.emitter = this.rainParticleSystem.createBoxEmitter(
      new Vector3(0, -10, 0),
      new Vector3(0, -10, 0),
      new Vector3(-5, 1, 0),
      new Vector3(5, 1, 5)
    );
    const particleColor = new Color4(
      rainParticleColor,
      rainParticleColor,
      rainParticleColor,
      rainParticleColor
    );
    this.rainParticleSystem.color1 = particleColor;
    this.rainParticleSystem.color2 = particleColor;
  }

  update(delta: number) {
    super.update(delta);

    const beta = this.game.camera.beta;
    this.rainParticleSystem.defaultViewMatrix = Matrix.LookAtLH(
      new Vector3(0, 0, 0),
      new Vector3(0, -Math.cos(beta), Math.sin(beta)),
      Vector3.UpReadOnly
    );
  }

  setIntensity(intensity: number) {
    super.setIntensity(intensity);
    this.rainParticleSystem.emitRate = this.rate * intensity;
  }

  activate() {
    this.rainParticleSystem.start();
    return super.activate();
  }

  deactivate() {
    super.deactivate();
    this.rainParticleSystem.stop();
  }
}
