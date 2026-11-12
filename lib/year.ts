import { Year } from '@civ-clone/core-game-year/Year';

/** Whether the year of `turn` is `target` or later: the game has reached its last year. */
export const yearReached = (
  year: Year,
  turn: number,
  target: number
): boolean => year.value(turn) >= target;

/**
 * Whether `turn` is the one whose year first reaches `target`: the year before it was earlier. Never the first turn, so
 * a game that starts past `target` doesn't count as crossing it.
 */
export const yearCrossed = (
  year: Year,
  turn: number,
  target: number
): boolean =>
  turn > 1 && year.value(turn) >= target && year.value(turn - 1) < target;
