"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.byLevel = void 0;
/**
 * A number that moves by `perLevel` for each difficulty level up from `atLevel0`: a ruleset's last year, or the last turn
 * a destroyed civilization comes back on, for `level()` of the game's difficulty. `perLevel` 0 gives the same number at
 * every level.
 */
const byLevel = (atLevel0, perLevel) => (level) => atLevel0 + perLevel * level;
exports.byLevel = byLevel;
exports.default = exports.byLevel;
//# sourceMappingURL=byLevel.js.map