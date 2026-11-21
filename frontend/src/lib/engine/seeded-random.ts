// =============================================================================
// SolarOS — Deterministic pseudo-random helpers
//
// Engines must be pure: the same input always yields the same output. Anything
// that needs variation (demo rooftop detections, sample ids) derives it from a
// string seed via FNV-1a hashing and the mulberry32 generator below. Never use
// Math.random() in an engine.
// =============================================================================

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** 32-bit FNV-1a hash of a string (unsigned integer). */
export function hashString(input: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

/** mulberry32: tiny, fast 32-bit PRNG. Returns a function yielding floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SeededRandom {
  /** Float in [0, 1). */
  next: () => number;
  /** Float in [min, max). */
  range: (min: number, max: number) => number;
  /** Integer in [min, max] (inclusive). */
  int: (min: number, max: number) => number;
  /** True with the given probability (0–1). */
  chance: (probability: number) => boolean;
  /** One element of a non-empty array. */
  pick: <T>(items: readonly T[]) => T;
  /** A shuffled copy (Fisher–Yates). */
  shuffle: <T>(items: readonly T[]) => T[];
}

/** Seeded generator from a string or numeric seed. */
export function createSeededRandom(seed: string | number): SeededRandom {
  const next = mulberry32(typeof seed === "number" ? seed : hashString(seed));
  const range = (min: number, max: number) => min + (max - min) * next();
  const int = (min: number, max: number) => Math.floor(range(min, max + 1));
  return {
    next,
    range,
    int,
    chance: (probability) => next() < probability,
    pick: (items) => {
      if (items.length === 0) throw new Error("pick() needs a non-empty array");
      return items[Math.min(items.length - 1, Math.floor(next() * items.length))];
    },
    shuffle: (items) => {
      const copy = items.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
  };
}

/** Short, stable base-36 id fragment for a seed, e.g. "k3x9q2". */
export function seededId(seed: string, length = 8): string {
  const first = hashString(seed).toString(36);
  const second = hashString(`${seed}::${first}`).toString(36);
  return `${first}${second}`.slice(0, length).padEnd(length, "0");
}
