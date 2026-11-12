import { conqueror, conquestBonusFor, isConquest } from '../lib/conquest';
import { yearCrossed, yearReached } from '../lib/year';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import { GameResultRegistry } from '@civ-clone/core-turn-based-game/GameResultRegistry';
import Player from '@civ-clone/core-player/Player';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { Year } from '@civ-clone/core-game-year/Year';
import byLevel from '../lib/byLevel';
import civilizations from '../lib/civilizations';
import { expect } from 'chai';
import inheritedAdvances from '../lib/inheritedAdvances';

// Stand-ins: only what the functions read.
const player = (barbarian = false): Player =>
    ({
      civilization: () => (barbarian ? Object.create(Barbarian.prototype) : {}),
    } as unknown as Player),
  players = (...entries: Player[]): PlayerRegistry =>
    ({ entries: () => entries } as unknown as PlayerRegistry),
  worlds = (...entries: Player[]): PlayerWorldRegistry =>
    ({
      entries: () => entries.map((entry) => ({ player: () => entry })),
    } as unknown as PlayerWorldRegistry),
  results = (
    result: { reason: string; winner: Player | null; turn: number } | null
  ): GameResultRegistry =>
    ({
      get: () =>
        result && {
          reason: () => result.reason,
          winner: () => result.winner,
          turn: () => result.turn,
        },
    } as unknown as GameResultRegistry);

describe('byLevel', (): void => {
  it('moves by a step for each level up', (): void => {
    expect([0, 1, 2, 3, 4, 5].map(byLevel(100, -10))).eql([
      100, 90, 80, 70, 60, 50,
    ]);
    expect([0, 5].map(byLevel(7, 0))).eql([7, 7]);
  });
});

describe('civilizations', (): void => {
  it('leaves out the barbarians', (): void => {
    const first = player(),
      barbarians = player(true),
      second = player();

    expect(civilizations([first, barbarians, second])).eql([first, second]);
  });
});

describe('conquest', (): void => {
  const first = player(),
    second = player(),
    barbarians = player(true);

  it('is one civilization left of a game that started with more', (): void => {
    expect(isConquest(players(first), worlds(first, second))).true;
    expect(
      isConquest(players(first, barbarians), worlds(first, second, barbarians))
    ).true;
    expect(conqueror(players(barbarians, first))).equal(first);
  });

  it('is not a game that started with one civilization, or still has two', (): void => {
    expect(isConquest(players(first, barbarians), worlds(first, barbarians)))
      .false;
    expect(isConquest(players(first, second), worlds(first, second))).false;
  });

  it('scores the bonus for the conqueror only, against every other civilization it started with', (): void => {
    const bonus = (turn: number, opponents: number): number =>
      turn * 1000 + opponents;

    expect(
      conquestBonusFor(
        first,
        results({ reason: 'conquest', winner: first, turn: 12 }),
        worlds(first, second, barbarians, player()),
        bonus
      )
    ).equal(12002);
    expect(
      conquestBonusFor(
        second,
        results({ reason: 'conquest', winner: first, turn: 12 }),
        worlds(first, second),
        bonus
      )
    ).null;
    expect(
      conquestBonusFor(
        first,
        results({ reason: 'date', winner: null, turn: 12 }),
        worlds(first, second),
        bonus
      )
    ).null;
    expect(conquestBonusFor(first, results(null), worlds(first), bonus)).null;
  });
});

describe('the year', (): void => {
  // Ten years a turn, from year 0 on turn 1.
  const year = { value: (turn: number) => (turn - 1) * 10 } as Year;

  it('is reached on the turn of the target year and after', (): void => {
    expect([10, 11, 12].map((turn) => yearReached(year, turn, 100))).eql([
      false,
      true,
      true,
    ]);
  });

  it('is crossed on that turn only, never on the first', (): void => {
    expect([10, 11, 12].map((turn) => yearCrossed(year, turn, 100))).eql([
      false,
      true,
      false,
    ]);
    expect(yearCrossed(year, 1, -100)).false;
  });
});

describe('inheritedAdvances', (): void => {
  // Players as strings, advances as strings: what each knows is all it reads.
  const knows: { [player: string]: string[] } = {
      A: ['first', 'second', 'third'],
      B: ['first', 'fourth', 'third'],
      C: ['fourth', 'fifth'],
      D: [],
    },
    completed = (entry: string): string[] => knows[entry],
    human = (entry: string): boolean => entry === 'A';

  it('with a person playing, is what they know that another civilization also knows', (): void => {
    expect(inheritedAdvances(['A', 'B', 'C', 'D'], human, completed)).eql([
      'first',
      'third',
    ]);
  });

  it('with no human seat, is what any two civilizations know', (): void => {
    expect(inheritedAdvances(['B', 'C', 'D'], () => false, completed)).eql([
      'fourth',
    ]);
  });

  it('is nothing when nobody shares an advance, or there is nobody', (): void => {
    expect(inheritedAdvances(['C', 'D'], () => false, completed)).eql([]);
    expect(inheritedAdvances([], () => false, completed)).eql([]);
  });

  it('with a person, two others sharing an advance the person lacks is not enough', (): void => {
    expect(
      inheritedAdvances(['A', 'B', 'C'], human, (entry) =>
        entry === 'A' ? [] : knows[entry]
      )
    ).eql([]);
  });
});
