/**
 * Seedable Pseudo-Random Number Generator using mulberry32 algorithm.
 * Provides deterministic random numbers for reproducible game simulations.
 */

function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) | 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SeededRNG {
  private nextFn: () => number;

  constructor(seed: number | string = Date.now()) {
    const numSeed = typeof seed === 'string'
      ? seed.split('').reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0)
      : seed;

    this.nextFn = mulberry32(numSeed);
  }

  /** Returns a float in [0, 1) */
  next(): number {
    return this.nextFn();
  }

  /** Returns an integer in [min, max] inclusive */
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Returns a float in [min, max) */
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Pick a random element from an array */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  /** Pick a random element excluding given indices */
  pickExcluding<T>(array: T[], excludeIndices: number[]): T {
    const available = array
      .map((item, i) => ({ item, i }))
      .filter(({ i }) => !excludeIndices.includes(i));
    if (available.length === 0) {
      return array[0];
    }
    return available[this.nextInt(0, available.length - 1)].item;
  }
}

/** Global game RNG instance - seeded once per game session */
let gameRng: SeededRNG = new SeededRNG();

export function initGameRng(seed: number | string): SeededRNG {
  gameRng = new SeededRNG(seed);
  return gameRng;
}

export function getGameRng(): SeededRNG {
  return gameRng;
}

/** Drop-in replacement for Math.random() using the seeded RNG */
export function gameRandom(): number {
  return gameRng.next();
}
