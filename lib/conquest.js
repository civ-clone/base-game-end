"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conquestBonusFor = exports.conqueror = exports.isConquest = void 0;
const civilizations_1 = require("./civilizations");
/**
 * Whether one civilization is left, in a game that started with others: it conquered the world, whoever destroyed the
 * rest. The players a game started with are those with a `PlayerWorld`: each has one from the start, kept when they are
 * destroyed.
 */
const isConquest = (playerRegistry, playerWorldRegistry) => (0, civilizations_1.default)(playerRegistry.entries()).length === 1 &&
    (0, civilizations_1.default)(playerWorldRegistry
        .entries()
        .map((playerWorld) => playerWorld.player())).length > 1;
exports.isConquest = isConquest;
/** The civilization that conquered the world: the one left. */
const conqueror = (playerRegistry) => {
    const [winner] = (0, civilizations_1.default)(playerRegistry.entries());
    return winner;
};
exports.conqueror = conqueror;
/**
 * The conquest bonus `player` scores, or `null` unless they conquered the world: `bonus` of the turn the game ended on
 * and the number of opponents, every other civilization the game started with.
 */
const conquestBonusFor = (player, gameResultRegistry, playerWorldRegistry, bonus) => {
    const gameResult = gameResultRegistry.get();
    if (gameResult === null ||
        gameResult.reason() !== 'conquest' ||
        gameResult.winner() !== player) {
        return null;
    }
    const opponents = (0, civilizations_1.default)(playerWorldRegistry
        .entries()
        .map((playerWorld) => playerWorld.player())).length - 1;
    return bonus(gameResult.turn(), opponents);
};
exports.conquestBonusFor = conquestBonusFor;
//# sourceMappingURL=conquest.js.map