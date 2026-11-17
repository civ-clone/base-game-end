import {
  AddPlayerGame,
  AddPlayerOptions,
} from '@civ-clone/base-player/lib/addPlayer';
import Player from '@civ-clone/core-player/Player';
import World from '@civ-clone/core-world/World';
/**
 * Brings a new player into a running game (`base-player`'s `addPlayer`) with the rules `heldOff` switched off while it
 * joins: the `Added` rules meant for the start of a game, such as a ruleset's random starting advances. Each rule found
 * by its id is switched back on afterwards, if it was on, even if adding the player throws. An id with no rule is
 * passed over. A destroyed civilization coming back and a civil war's rebels join this way.
 */
export declare const addPlayerHoldingOff: (
  game: AddPlayerGame,
  world: World,
  heldOff: string[],
  options?: AddPlayerOptions
) => Player;
export default addPlayerHoldingOff;
