import { Game } from "../../game/game";
import { IWeather } from "./weather";

export class Cloudy implements IWeather {
  constructor(private game: Game) {}

  update(delta: number): void {}
  activate(): void {}
  deactivate(): void {}
}
