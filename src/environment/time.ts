const timeFactor = 600;

export class Time {
  private time: number = 8;

  getTime() {
    return this.time;
  }

  update(delta: number) {
    this.time += (delta * timeFactor) / 3600;
    this.time = this.time % 24;
  }
}
