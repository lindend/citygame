import { Game } from "../game/game";

export class SkyController {
  constructor(private game: Game) {}

  update(delta: number) {
    const sky = this.game.sky;
    this.game.scene.clearColor = sky.getSkyColor();
    this.game.scene.fogColor = sky.getFogColor();
    const sunLight = sky.getSunLight();
    const ambientLight = sky.getAmbientLight();
    this.game.sunLight.diffuse.r = sunLight.r;
    this.game.sunLight.diffuse.g = sunLight.g;
    this.game.sunLight.diffuse.b = sunLight.b;
    this.game.ambientLight.diffuse.r = ambientLight.r;
    this.game.ambientLight.diffuse.g = ambientLight.g;
    this.game.ambientLight.diffuse.b = ambientLight.b;
    this.game.sunLight.direction = sky.getSunAngle();
  }
}
