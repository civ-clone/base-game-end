"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPlayerHoldingOff = void 0;
const addPlayer_1 = require("@civ-clone/base-player/lib/addPlayer");
/**
 * Brings a new player into a running game (`base-player`'s `addPlayer`) with the rules `heldOff` switched off while it
 * joins: the `Added` rules meant for the start of a game, such as a ruleset's random starting advances. Each rule found
 * by its id is switched back on afterwards, if it was on, even if adding the player throws. An id with no rule is
 * passed over. A destroyed civilization coming back and a civil war's rebels join this way.
 */
const addPlayerHoldingOff = (game, world, heldOff, options = {}) => {
    const held = heldOff
        .map((id) => game.rules.getById(id))
        .filter((rule) => rule !== null)
        .map((rule) => [rule, rule.enabled()]);
    held.forEach(([rule]) => rule.disable());
    try {
        return (0, addPlayer_1.default)(game, world, options);
    }
    finally {
        held.forEach(([rule, enabled]) => {
            if (enabled) {
                rule.enable();
            }
        });
    }
};
exports.addPlayerHoldingOff = addPlayerHoldingOff;
exports.default = exports.addPlayerHoldingOff;
//# sourceMappingURL=addPlayerHoldingOff.js.map