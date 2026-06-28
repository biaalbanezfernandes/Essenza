import { describe, it, expect } from 'vitest';
import { SeededRNG, initGameRng, getGameRng, gameRandom } from '../rng';

describe('SeededRNG', () => {
  it('produces deterministic sequence for same seed', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);

    for (let i = 0; i < 100; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(99);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).not.toEqual(seq2);
  });

  it('next() returns values in [0, 1)', () => {
    const rng = new SeededRNG(123);
    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('nextInt returns values in inclusive range', () => {
    const rng = new SeededRNG(456);
    for (let i = 0; i < 1000; i++) {
      const val = rng.nextInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('pick returns element from array', () => {
    const rng = new SeededRNG(789);
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 100; i++) {
      const picked = rng.pick(arr);
      expect(arr).toContain(picked);
    }
  });

  it('pickExcluding avoids excluded indices', () => {
    const rng = new SeededRNG(101);
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 100; i++) {
      const picked = rng.pickExcluding(arr, [0, 1]);
      expect(['c', 'd']).toContain(picked);
    }
  });

  it('accepts string seed', () => {
    const rng1 = new SeededRNG('hello');
    const rng2 = new SeededRNG('hello');

    for (let i = 0; i < 50; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });
});

describe('Global RNG', () => {
  it('initGameRng returns initialized RNG', () => {
    const rng = initGameRng(42);
    expect(rng).toBeInstanceOf(SeededRNG);
  });

  it('getGameRng returns the global instance', () => {
    initGameRng(42);
    const rng = getGameRng();
    expect(rng).toBeInstanceOf(SeededRNG);
  });

  it('gameRandom uses global RNG', () => {
    initGameRng(42);
    const val = gameRandom();
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThan(1);
  });

  it('re-initializing with same seed produces same sequence', () => {
    initGameRng(42);
    const seq1 = Array.from({ length: 5 }, () => gameRandom());

    initGameRng(42);
    const seq2 = Array.from({ length: 5 }, () => gameRandom());

    expect(seq1).toEqual(seq2);
  });
});
