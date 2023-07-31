export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function progress(value: number, min: number, max: number) {
  return clamp((value - min) / (max - min), 0, 1);
}

export function lerp(min: number, max: number, progress: number) {
  return min * (1 - progress) + max * progress;
}
