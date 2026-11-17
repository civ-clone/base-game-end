"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respawn = exports.respawns = void 0;
const Respawns_1 = require("../Rules/Respawns");
const Spawn_1 = require("@civ-clone/core-player/Rules/Spawn");
const addPlayerHoldingOff_1 = require("./addPlayerHoldingOff");
const inheritedAdvances_1 = require("./inheritedAdvances");
/**
 * Whether a destroyed civilization comes back: every `Respawns` rule agrees, or, with none registered, `fallback`. A
 * ruleset may register its gate as a rule, or keep it as a number of its own and pass it here.
 */
const respawns = (player, ruleRegistry, fallback = () => true) => {
    if (ruleRegistry.get(Respawns_1.default).length === 0) {
        return fallback();
    }
    return ruleRegistry
        .process(Respawns_1.default, player)
        .every((comesBack) => comesBack);
};
exports.respawns = respawns;
/**
 * A destroyed civilization comes back as a new player, for a ruleset's `Defeated` rule to call once it has decided that
 * it does (`respawns`), so the world can't be conquered for good too early. In order:
 *
 * 1. `site()`: with nowhere to come back, nothing happens and it returns `null`;
 * 2. the player joins (`addPlayerHoldingOff`), with the `heldOff` rules off;
 * 3. each advance it may inherit (`advances`) is added where `inherits` says so;
 * 4. the `Spawn` rules give it its units at the site, as the ruleset's are;
 * 5. `player:respawned` is emitted, with the new player and the one destroyed.
 *
 * Which civilization it plays is drawn by `addPlayer`. The rules that turn it on and off are the ruleset's: a game
 * setting can switch off the `Defeated` rule that calls this, with a `RuleSet` holding its id.
 */
const respawn = (game, defeated, { advances, heldOff = [], inherits, isHuman, site }) => {
    const tile = site();
    if (tile === null) {
        return null;
    }
    const player = (0, addPlayerHoldingOff_1.default)(game, tile.map(), heldOff), research = game.playerResearch.getByPlayer(player), others = game.players
        .entries()
        .filter((other) => other !== player);
    (advances
        ? advances(others, player)
        : (0, inheritedAdvances_1.default)(others, isHuman, (other) => game.playerResearch
            .getByPlayer(other)
            .complete()
            .map((advance) => advance.sourceClass()))).forEach((AdvanceType) => {
        if (inherits(AdvanceType, player)) {
            research.addAdvance(AdvanceType);
        }
    });
    game.rules.process(Spawn_1.default, player, tile);
    game.engine.emit('player:respawned', player, defeated);
    return player;
};
exports.respawn = respawn;
exports.default = exports.respawn;
//# sourceMappingURL=respawn.js.map