"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yearCrossed = exports.yearReached = void 0;
/** Whether the year of `turn` is `target` or later: the game has reached its last year. */
const yearReached = (year, turn, target) => year.value(turn) >= target;
exports.yearReached = yearReached;
/**
 * Whether `turn` is the one whose year first reaches `target`: the year before it was earlier. Never the first turn, so
 * a game that starts past `target` doesn't count as crossing it.
 */
const yearCrossed = (year, turn, target) => turn > 1 && year.value(turn) >= target && year.value(turn - 1) < target;
exports.yearCrossed = yearCrossed;
//# sourceMappingURL=year.js.map