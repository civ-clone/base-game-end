import Advance from '@civ-clone/core-science/Advance';
import { AddPlayerGame } from '@civ-clone/base-player/lib/addPlayer';
import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import Respawns from '../Rules/Respawns';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Spawn from '@civ-clone/core-player/Rules/Spawn';
import Tile from '@civ-clone/core-world/Tile';
import addPlayerHoldingOff from './addPlayerHoldingOff';
import inheritedAdvances from './inheritedAdvances';

// The parts of a game a civilization coming back needs. A `Game` has them all.
export type RespawnGame = AddPlayerGame & Pick<Game, 'playerResearch'>;

export type RespawnOptions = {
  /** Where it comes back, or `null` for nowhere, when it doesn't. Asked first, before anything changes. */
  site: () => Tile | null;
  /** The ids of rules held off while it joins (`addPlayerHoldingOff`), such as the ruleset's starting advances. */
  heldOff?: string[];
  /** Whether a player is a person's, for which advances it may inherit. */
  isHuman: (player: Player) => boolean;
  /**
   * The advances it may inherit, from the civilizations already in the game. Left out, `inheritedAdvances`: what a
   * human knows that another civilization also knows, or with no human seat, what any two know.
   */
  advances?: (others: Player[], player: Player) => (typeof Advance)[];
  /** Whether it gets an advance it may inherit, asked once for each, in order: a ruleset's chance, say. */
  inherits: (AdvanceType: typeof Advance, player: Player) => boolean;
};

/**
 * Whether a destroyed civilization comes back: every `Respawns` rule agrees, or, with none registered, `fallback`. A
 * ruleset may register its gate as a rule, or keep it as a number of its own and pass it here.
 */
export const respawns = (
  player: Player,
  ruleRegistry: RuleRegistry,
  fallback: () => boolean = (): boolean => true
): boolean => {
  if (ruleRegistry.get(Respawns).length === 0) {
    return fallback();
  }

  return ruleRegistry
    .process(Respawns, player)
    .every((comesBack: boolean): boolean => comesBack);
};

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
export const respawn = (
  game: RespawnGame,
  defeated: Player,
  { advances, heldOff = [], inherits, isHuman, site }: RespawnOptions
): Player | null => {
  const tile = site();

  if (tile === null) {
    return null;
  }

  const player = addPlayerHoldingOff(game, tile.map(), heldOff),
    research = game.playerResearch.getByPlayer(player),
    others = game.players
      .entries()
      .filter((other: Player): boolean => other !== player);

  (advances
    ? advances(others, player)
    : inheritedAdvances(others, isHuman, (other: Player): (typeof Advance)[] =>
        game.playerResearch
          .getByPlayer(other)
          .complete()
          .map((advance: Advance) => advance.sourceClass<typeof Advance>())
      )
  ).forEach((AdvanceType: typeof Advance): void => {
    if (inherits(AdvanceType, player)) {
      research.addAdvance(AdvanceType);
    }
  });

  game.rules.process(Spawn, player, tile);

  game.engine.emit('player:respawned', player, defeated);

  return player;
};

export default respawn;
