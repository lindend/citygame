export enum KeyState {
  Up,
  Down,
  Pressed,
  Released,
}

export class InputManager {
  private keyStates: { [key: string]: KeyState } = {};
  private scroll: number = 0;

  private mouseEvents: MouseEvent[] = [];
  private keyEvents: KeyboardEvent[] = [];

  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", (evt) => {
      this.keyEvents.push(evt);
    });
    window.addEventListener("keyup", (evt) => {
      this.keyEvents.push(evt);
    });
    canvas.addEventListener("mousemove", (evt) => {
      this.mouseEvents.push(evt);
    });
    canvas.addEventListener("mousedown", (evt) => {
      this.mouseEvents.push(evt);
    });
    canvas.addEventListener("mouseup", (evt) => {
      this.mouseEvents.push(evt);
    });
    canvas.addEventListener("wheel", (evt) => {
      this.scroll += evt.deltaY;
    });
  }

  getKeyState(key: string) {
    return this.keyStates[key] || KeyState.Up;
  }

  isKeyDown(key: string) {
    const state = this.getKeyState(key);
    return state == KeyState.Down || state == KeyState.Pressed;
  }

  getScroll() {
    return this.scroll;
  }

  update() {
    for (let key in this.keyStates) {
      const state = this.keyStates[key];
      if (state == KeyState.Released) {
        this.keyStates[key] = KeyState.Up;
      } else if (state == KeyState.Pressed) {
        this.keyStates[key] = KeyState.Down;
      }
    }

    for (let keyEvent of this.keyEvents) {
      switch (keyEvent.type) {
        case "keydown":
          this.keyStates[keyEvent.key] = KeyState.Pressed;
          break;
        case "keyup":
          this.keyStates[keyEvent.key] = KeyState.Released;
          break;
      }
      keyEvent.key;
    }

    this.keyEvents = [];
    this.mouseEvents = [];
    this.scroll = 0;
  }

  getMousePos() {}
}
