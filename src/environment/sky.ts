import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import {
  MaxPriorityQueue,
  PriorityQueue,
} from "@datastructures-js/priority-queue";

type SkyColor = {
  color: Color4;
  priority: number;
  source: string;
};

type SunAngle = {
  angle: Vector3;
  priority: number;
  source: string;
};

function byPriority(c: SkyColor) {
  return c.priority;
}

export const DefaultSkyColor = new Color4(0.53, 0.81, 0.98, 1.0);
export const DefaultSunColor = new Color4(1.2, 1.2, 1.2, 1);
export const DefaultAmbientColor = new Color4(0.15, 0.15, 0.25, 1);

export class Sky {
  private colors: PriorityQueue<SkyColor>;
  private intensities: PriorityQueue<SkyColor>;

  private sunColor: PriorityQueue<SkyColor>;
  private ambientColor: PriorityQueue<SkyColor>;
  private sunIntensities: PriorityQueue<SkyColor>;
  private ambientIntensities: PriorityQueue<SkyColor>;

  private sunAngle: PriorityQueue<SunAngle>;

  constructor() {
    this.colors = new MaxPriorityQueue(byPriority);
    this.colors.push({
      color: DefaultSkyColor,
      priority: 0,
      source: "root",
    });

    this.intensities = new MaxPriorityQueue(byPriority);
    this.intensities.push({
      color: new Color4(1, 1, 1, 1),
      priority: 0,
      source: "root",
    });

    this.sunColor = new MaxPriorityQueue((e) => e.priority);
    this.sunColor.push({
      color: DefaultSunColor,
      priority: 0,
      source: "root",
    });

    this.ambientColor = new MaxPriorityQueue((e) => e.priority);
    this.ambientColor.push({
      color: DefaultAmbientColor,
      priority: 0,
      source: "root",
    });

    this.sunIntensities = new MaxPriorityQueue(byPriority);
    this.sunIntensities.push({
      color: new Color4(1, 1, 1, 1),
      priority: 0,
      source: "root",
    });
    this.ambientIntensities = new MaxPriorityQueue(byPriority);
    this.ambientIntensities.push({
      color: new Color4(1, 1, 1, 1),
      priority: 0,
      source: "root",
    });

    this.sunAngle = new MaxPriorityQueue((s) => s.priority);
    this.sunAngle.push({
      angle: new Vector3(0, -1, 0),
      priority: 0,
      source: "root",
    });
  }

  setSkyColorIntensity(intensity: number, source: string, priority: number) {
    this.removeSkyColorIntensity(source);
    this.intensities.push({
      color: new Color4(intensity, intensity, intensity, 1),
      priority: priority,
      source,
    });
  }

  removeSkyColorIntensity(source: string) {
    this.intensities.remove((s) => s.source == source);
  }

  setSkyColor(color: Color4, source: string, priority: number) {
    this.removeSkyColor(source);
    this.colors.push({
      color,
      source,
      priority,
    });
  }

  removeSkyColor(source: string) {
    this.colors.remove((s) => s.source == source);
  }

  setSunColor(color: Color4, source: string, priority: number) {
    this.removeSunColor(source);
    this.sunColor.push({
      color,
      source,
      priority,
    });
  }

  removeSunColor(source: string) {
    this.sunColor.remove((s) => s.source == source);
  }

  setAmbientColor(color: Color4, source: string, priority: number) {
    this.removeAmbientColor(source);
    this.ambientColor.push({
      color,
      source,
      priority,
    });
  }

  removeAmbientColor(source: string) {
    this.ambientColor.remove((s) => s.source == source);
  }

  setSunIntensity(intensity: number, source: string, priority: number) {
    this.removeSunIntensity(source);
    this.sunIntensities.push({
      color: new Color4(intensity, intensity, intensity, 1),
      source,
      priority,
    });
  }

  removeSunIntensity(source: string) {
    this.sunIntensities.remove((s) => s.source == source);
  }

  setAmbientIntensity(intensity: number, source: string, priority: number) {
    this.removeAmbientIntensity(source);
    this.ambientIntensities.push({
      color: new Color4(intensity, intensity, intensity, 1),
      source,
      priority,
    });
  }

  removeAmbientIntensity(source: string) {
    this.ambientIntensities.remove((s) => s.source == source);
  }

  setSunAngle(angle: Vector3, source: string, priority: number) {
    this.removeSunAngle(source);
    this.sunAngle.push({
      angle,
      source,
      priority,
    });
  }

  removeSunAngle(source: string) {
    this.sunAngle.remove((p) => p.source == source);
  }

  private sumIntensities(intensities: PriorityQueue<SkyColor>) {
    const intensityArray = intensities.toArray();
    let prio = intensityArray[0].priority;
    let result = intensityArray[0].color;
    for (let i = 1; i < intensityArray.length; ++i) {
      if (prio != intensityArray[i].priority) {
        return result;
      }
      result = result.multiply(intensityArray[i].color);
    }
    return result;
  }

  getSkyColorIntensity() {
    return this.sumIntensities(this.intensities);
  }

  getSunColorIntensity() {
    return this.sumIntensities(this.sunIntensities);
  }

  getAmbientLightIntensity() {
    return this.sumIntensities(this.ambientIntensities);
  }

  getSkyColor() {
    return this.colors.front().color.multiply(this.getSkyColorIntensity());
  }

  getSunLight() {
    return this.sunColor.front().color.multiply(this.getSunColorIntensity());
  }

  getAmbientLight() {
    return this.ambientColor
      .front()
      .color.multiply(this.getAmbientLightIntensity());
  }

  getSunAngle() {
    return this.sunAngle.front().angle;
  }

  getFogColor() {
    const sky = this.getSkyColor();
    return new Color3(sky.r, sky.g, sky.b);
  }
}
