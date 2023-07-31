export interface IWeather {
  update(delta: number): void;
  activate(): void;
  deactivate(): void;
}
