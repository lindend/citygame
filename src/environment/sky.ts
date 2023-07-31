import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";

export class Sky {
  private color: Color4 = new Color4(0.53, 0.81, 0.98, 1.0);
  private intensity: Color4 = new Color4(1, 1, 1, 1);

  setIntensity(intensity: number) {
    this.intensity.r = intensity;
    this.intensity.g = intensity;
    this.intensity.b = intensity;
  }

  getSkyColor() {
    return this.color.multiply(this.intensity);
  }

  getFogColor() {
    const sky = this.getSkyColor();
    return new Color3(sky.r, sky.g, sky.b);
  }
}
