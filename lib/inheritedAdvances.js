"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inheritedAdvances = void 0;
/**
 * The advances a civilization coming back may inherit: with a person playing, what a human knows that another
 * civilization also knows; with no human seat, what any two civilizations know (common knowledge, as the first rule
 * means it to be, since with no human it would always be empty). The ruleset decides what each is worth, such as an
 * even chance of each.
 *
 * `players` are the civilizations in the game other than the one coming back; `completed` says what each knows.
 * Each advance comes back once, in the order first met.
 */
const inheritedAdvances = (players, isHuman, completed) => {
    const humans = players.filter(isHuman), others = players.filter((player) => !humans.includes(player)), known = new Map();
    players.forEach((player) => completed(player).forEach((advance) => {
        if (!known.has(advance)) {
            known.set(advance, new Set());
        }
        known.get(advance).add(player);
    }));
    return [...known.entries()]
        .filter(([, knownBy]) => humans.length > 0
        ? humans.some((human) => knownBy.has(human)) &&
            others.some((other) => knownBy.has(other))
        : knownBy.size >= 2)
        .map(([advance]) => advance);
};
exports.inheritedAdvances = inheritedAdvances;
exports.default = exports.inheritedAdvances;
//# sourceMappingURL=inheritedAdvances.js.map