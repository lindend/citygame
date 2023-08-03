import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Game } from "../../game/game";
import { IWeather, WeatherEnvironment } from "./weather";
import { DefaultSunColor } from "../sky";

export const LightCoverage = 0.4;
export const OvercastCoverage = 0.8;

export class Cloudy implements IWeather {
  constructor(private coverage: number, protected game: Game) {}

  update(delta: number) {}
  setIntensity(intensity: number) {}

  activate(): WeatherEnvironment {
    return {
      skyColor: new Color4(0.8, 0.8, 0.8, 1),
      skyIntensity: 1 - this.coverage * this.coverage,
      sunColor: DefaultSunColor,
      sunIntensity: 1 - this.coverage,
      ambientColor: new Color4(0.15, 0.15, 0.15, 1),
      ambientIntensity: 1,
    };
  }
  deactivate() {}
}
