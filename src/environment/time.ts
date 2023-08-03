const timeFactor = 600;

export class Time {
  private time: number = 8;
  private deltaTime: number = 0;

  getTime() {
    return this.time;
  }

  getDeltaTime() {
    return this.deltaTime;
  }

  update(delta: number) {
    this.deltaTime = (delta * timeFactor) / 3600;
    this.time += this.deltaTime;
    this.time = this.time % 24;
  }
}
