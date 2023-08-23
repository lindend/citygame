import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Game } from "../game/game";
import { progress } from "../math";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";

const dawn = 5;
const dusk = 20;
const nightWindowRampTime = 0.2;
const skyRampTime = 2;
const skyRampOffset = 1;

const sunXFactor = 0.8;

const windowGlowColor = new Color3(0.81, 0.62, 0.34);

export class DayNightCycleController {
  // Time of day in hours
  private glowLayer: GlowLayer;

  constructor(private game: Game) {
    this.glowLayer = new GlowLayer("windows", this.game.scene);
    this.glowLayer.blurKernelSize = 25;
  }

  update(delta: number) {
    const time = this.game.time.getTime();
    // Sun
    const sunProgress = progress(time, dawn, dusk) * Math.PI;
    const cosAngle = Math.cos(sunProgress);
    const sunAngle = new Vector3(
      sunXFactor * cosAngle,
      -Math.sin(sunProgress),
      Math.sqrt(1 - sunXFactor * sunXFactor) * cosAngle
    );
    this.game.sky.setSunAngle(sunAngle, "DayNightCycle", 1);
    this.game.sky.setSunIntensity(Math.sin(sunProgress), "DayNightCycle", 1);

    // Glowing windows
    if (time < dawn || time > dusk) {
      let ramp = 1;
      if (time > dusk) {
        ramp = progress(time, dusk, dusk + nightWindowRampTime);
      } else {
        ramp = 1 - progress(time, dawn - nightWindowRampTime, dawn);
      }

      var windowEmissiveColor = new Color3(ramp, ramp, ramp);
      this.game.materials.window.emissiveColor =
        windowGlowColor.multiply(windowEmissiveColor);
      this.glowLayer.isEnabled = true;
    } else {
      this.game.materials.window.emissiveColor = Color3.BlackReadOnly;
      this.game.materials.window_inverted.emissiveColor = Color3.BlackReadOnly;
      this.glowLayer.isEnabled = false;
    }

    // Sky color
    if (time > dawn - skyRampTime && time < dusk + skyRampTime) {
      let ramp =
        progress(time - skyRampOffset, dawn - skyRampTime, dawn) *
        (1 - progress(time + skyRampOffset, dusk, dusk + skyRampTime));
      this.game.sky.setSkyColorIntensity(ramp, "DayNightCycle", 1);
    } else {
      this.game.sky.setSkyColorIntensity(0, "DayNightCycle", 1);
    }
  }
}
