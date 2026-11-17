import Advance from '@civ-clone/core-science/Advance';
import { AddPlayerGame } from '@civ-clone/base-player/lib/addPlayer';
import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
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
export declare const respawns: (
  player: Player,
  ruleRegistry: RuleRegistry,
  fallback?: () => boolean
) => boolean;
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
export declare const respawn: (
  game: RespawnGame,
  defeated: Player,
  { advances, heldOff, inherits, isHuman, site }: RespawnOptions
) => Player | null;
export default respawn;
