export interface IGameState {
  update(delta: number): void;
}

export class EmptyGameState implements IGameState {
  update(delta: number): void {}
}
