import Player from '@civ-clone/core-player/Player';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/** The players that are civilizations: everyone but the barbarians, who neither win a game nor stand in the way. */
export const civilizations = (players: Player[]): Player[] =>
  players.filter((player: Player): boolean => !isBarbarian(player));

export default civilizations;
