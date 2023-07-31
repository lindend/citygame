import { IWeather } from "./weather";

export class EmptyWeather implements IWeather {
  update(delta: number): void {}
  activate(): void {}
  deactivate(): void {}
}
