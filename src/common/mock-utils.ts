/**
 * Deterministic pseudo-random score in [min, max], derived from a seed string.
 * Used only by the mock tool implementations so results vary per zone without
 * being truly random (same input always reproduces the same demo output).
 * Delete this once tools call real APIs.
 */
export function seededScore(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 1000) / 1000;
  return Math.round(min + normalized * (max - min));
}
