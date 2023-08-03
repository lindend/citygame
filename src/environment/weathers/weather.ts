import { Color4 } from "@babylonjs/core/Maths/math.color";

export type WeatherEnvironment = {
  skyColor: Color4;
  skyIntensity: number;
  sunColor: Color4;
  sunIntensity: number;
  ambientColor: Color4;
  ambientIntensity: number;
};

export interface IWeather {
  update(delta: number): void;
  setIntensity(intensity: number): void;
  activate(): WeatherEnvironment;
  deactivate(): void;
}
