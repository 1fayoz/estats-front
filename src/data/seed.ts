function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const rng = mulberry32(20260518);

export function rand(min: number, max: number, r = rng): number {
  return r() * (max - min) + min;
}

export function randInt(min: number, max: number, r = rng): number {
  return Math.floor(rand(min, max + 1, r));
}

export function pick<T>(arr: readonly T[], r = rng): T {
  return arr[Math.floor(r() * arr.length)];
}
