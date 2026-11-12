import { Year } from '@civ-clone/core-game-year/Year';
/** Whether the year of `turn` is `target` or later: the game has reached its last year. */
export declare const yearReached: (
  year: Year,
  turn: number,
  target: number
) => boolean;
/**
 * Whether `turn` is the one whose year first reaches `target`: the year before it was earlier. Never the first turn, so
 * a game that starts past `target` doesn't count as crossing it.
 */
export declare const yearCrossed: (
  year: Year,
  turn: number,
  target: number
) => boolean;
