/**
 * A number that moves by `perLevel` for each difficulty level up from `atLevel0`: a ruleset's last year, or the last turn
 * a destroyed civilization comes back on, for `level()` of the game's difficulty. `perLevel` 0 gives the same number at
 * every level.
 */
export declare const byLevel: (
  atLevel0: number,
  perLevel: number
) => (level: number) => number;
export default byLevel;
