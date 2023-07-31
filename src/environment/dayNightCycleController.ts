import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Game } from "../game/game";
import { progress } from "../math";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";

const timeFactor = 6000;
const dawn = 5;
const dusk = 20;
const nightWindowRampTime = 0.2;
const skyRampTime = 2;
const skyRampOffset = 1;

const sunXFactor = 0.8;

const windowGlowColor = new Color3(0.81, 0.62, 0.34);

export class DayNightCycleController {
  // Time of day in hours
  private time: number = 12;
  private glowLayer: GlowLayer;

  constructor(private game: Game) {
    this.glowLayer = new GlowLayer("windows", this.game.scene);
    this.glowLayer.blurKernelSize = 25;
  }

  update(delta: number) {
    this.time += (delta * timeFactor) / 3600;
    this.time = this.time % 24;

    // Sun
    const sunProgress = progress(this.time, dawn, dusk) * Math.PI;
    const cosAngle = Math.cos(sunProgress);
    const sunAngle = new Vector3(
      sunXFactor * cosAngle,
      -Math.sin(sunProgress),
      Math.sqrt(1 - sunXFactor * sunXFactor) * cosAngle
    );
    this.game.sunLight.direction = sunAngle;
    this.game.sunLight.intensity = Math.sin(sunProgress);

    // Glowing windows
    if (this.time < dawn || this.time > dusk) {
      let ramp = 1;
      if (this.time > dusk) {
        ramp = progress(this.time, dusk, dusk + nightWindowRampTime);
      } else {
        ramp = 1 - progress(this.time, dawn - nightWindowRampTime, dawn);
      }
      this.game.materials.window.emissiveColor = windowGlowColor.multiply(
        new Color3(ramp, ramp, ramp)
      );
      this.glowLayer.isEnabled = true;
    } else {
      this.game.materials.window.emissiveColor = Color3.BlackReadOnly;
      this.glowLayer.isEnabled = false;
    }

    // Sky color
    if (this.time > dawn - skyRampTime && this.time < dusk + skyRampTime) {
      let ramp =
        progress(this.time - skyRampOffset, dawn - skyRampTime, dawn) *
        (1 - progress(this.time + skyRampOffset, dusk, dusk + skyRampTime));
      this.game.sky.setIntensity(ramp);
    } else {
      this.game.sky.setIntensity(0);
    }
  }
}
