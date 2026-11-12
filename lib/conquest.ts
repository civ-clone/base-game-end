import { GameResultRegistry } from '@civ-clone/core-turn-based-game/GameResultRegistry';
import Player from '@civ-clone/core-player/Player';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import civilizations from './civilizations';

/**
 * Whether one civilization is left, in a game that started with others: it conquered the world, whoever destroyed the
 * rest. The players a game started with are those with a `PlayerWorld`: each has one from the start, kept when they are
 * destroyed.
 */
export const isConquest = (
  playerRegistry: PlayerRegistry,
  playerWorldRegistry: PlayerWorldRegistry
): boolean =>
  civilizations(playerRegistry.entries()).length === 1 &&
  civilizations(
    playerWorldRegistry
      .entries()
      .map((playerWorld: PlayerWorld): Player => playerWorld.player())
  ).length > 1;

/** The civilization that conquered the world: the one left. */
export const conqueror = (playerRegistry: PlayerRegistry): Player => {
  const [winner] = civilizations(playerRegistry.entries());

  return winner;
};

/**
 * The conquest bonus `player` scores, or `null` unless they conquered the world: `bonus` of the turn the game ended on
 * and the number of opponents, every other civilization the game started with.
 */
export const conquestBonusFor = (
  player: Player,
  gameResultRegistry: GameResultRegistry,
  playerWorldRegistry: PlayerWorldRegistry,
  bonus: (turn: number, opponents: number) => number
): number | null => {
  const gameResult = gameResultRegistry.get();

  if (
    gameResult === null ||
    gameResult.reason() !== 'conquest' ||
    gameResult.winner() !== player
  ) {
    return null;
  }

  const opponents =
    civilizations(
      playerWorldRegistry
        .entries()
        .map((playerWorld: PlayerWorld): Player => playerWorld.player())
    ).length - 1;

  return bonus(gameResult.turn(), opponents);
};
