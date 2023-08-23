import { DefaultAmbientColor, DefaultSkyColor, DefaultSunColor } from "../sky";
import { IWeather, WeatherEnvironment } from "./weather";

export class Sunny implements IWeather {
  update(_delta: number) {}
  setIntensity(_intensity: number) {}
  activate(): WeatherEnvironment {
    return {
      sunColor: DefaultSunColor,
      sunIntensity: 1,
      ambientColor: DefaultAmbientColor,
      ambientIntensity: 1,
      skyColor: DefaultSkyColor,
      skyIntensity: 1,
    };
  }
  deactivate() {}
}
