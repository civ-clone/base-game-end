import respawn, { respawns } from '../lib/respawn';
import Added from '@civ-clone/core-player/Rules/Added';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import Civilization from '@civ-clone/core-civilization/Civilization';
import Criterion from '@civ-clone/core-rule/Criterion';
import Defeated from '@civ-clone/core-player/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import Leader from '@civ-clone/core-civilization/Leader';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Respawns from '../Rules/Respawns';
import RuleSet from '@civ-clone/core-rule/RuleSet';
import Spawn from '@civ-clone/core-player/Rules/Spawn';
import Tile from '@civ-clone/core-world/Tile';
import addPlayerHoldingOff from '../lib/addPlayerHoldingOff';
import { expect } from 'chai';
import { generateWorld } from '@civ-clone/core-world/tests/lib/buildWorld';

class Testers extends Civilization {}
class Tester extends Leader {
  static civilization(): typeof Civilization {
    return Testers;
  }
}
class Others extends Civilization {}
class Other extends Leader {
  static civilization(): typeof Civilization {
    return Others;
  }
}
class Thirds extends Civilization {}
class Third extends Leader {
  static civilization(): typeof Civilization {
    return Thirds;
  }
}
class Pottery extends Advance {}
class Writing extends Advance {}
class Masonry extends Advance {}

const setUp = async () => {
  const game = new Game(),
    world = await generateWorld(undefined, game.rules),
    advances = new AdvanceRegistry(),
    log: string[] = [],
    starting: Player[] = [];

  advances.register(Pottery, Writing, Masonry);
  game.civilizations.register(Testers, Others, Thirds);
  game.leaders.register(Tester, Other, Third);
  game.rules.register(
    new Added(
      new Effect((player: Player): void =>
        game.playerResearch.register(
          new PlayerResearch(player, advances, game.rules)
        )
      )
    ),
    new Added(
      'test:player/added/starting-advances',
      new Effect((player: Player): void => {
        starting.push(player);
      })
    ),
    new Spawn(
      new Effect((player: Player, tile: Tile): void => {
        log.push(`spawn ${tile.x()},${tile.y()}`);
      })
    )
  );
  game.engine.on('player:respawned', (player: Player, defeated: Player) =>
    log.push(`respawned, ${defeated === player ? 'same' : 'new'} player`)
  );

  return { game, log, starting, world };
};

describe('addPlayerHoldingOff', (): void => {
  it('holds the rules off while the player joins, and leaves off one that was off', async (): Promise<void> => {
    const { game, starting, world } = await setUp(),
      startingAdvances = game.rules.getById(
        'test:player/added/starting-advances'
      )!;

    const player = addPlayerHoldingOff(game, world, [
      'test:player/added/starting-advances',
      'test:no-such-rule',
    ]);

    expect(starting).eql([]);
    expect(startingAdvances.enabled()).true;
    expect(game.players.entries()).eql([player]);

    startingAdvances.disable();
    addPlayerHoldingOff(game, world, ['test:player/added/starting-advances']);

    expect(startingAdvances.enabled()).false;
  });

  it('switches the rules back on when the player can’t join', async (): Promise<void> => {
    const { game, world } = await setUp();

    game.civilizations.unregister(Testers, Others, Thirds);

    expect(() =>
      addPlayerHoldingOff(game, world, ['test:player/added/starting-advances'])
    ).throw(TypeError);
    expect(game.rules.getById('test:player/added/starting-advances')!.enabled())
      .true;
  });
});

describe('respawns', (): void => {
  it('asks every Respawns rule, or the fallback when there are none', async (): Promise<void> => {
    const { game } = await setUp(),
      player = new Player(game.rules);

    expect(respawns(player, game.rules)).true;
    expect(respawns(player, game.rules, () => false)).false;

    game.rules.register(new Respawns(new Effect((): boolean => true)));

    expect(respawns(player, game.rules, () => false)).true;

    game.rules.register(new Respawns(new Effect((): boolean => false)));

    expect(respawns(player, game.rules)).false;
  });

  it('asks the fallback when no registered Respawns rule answers', async (): Promise<void> => {
    const { game } = await setUp(),
      player = new Player(game.rules);

    game.rules.register(
      new Respawns(
        new Criterion((): boolean => false),
        new Effect((): boolean => true)
      )
    );

    expect(respawns(player, game.rules, () => false)).false;
    expect(respawns(player, game.rules, () => true)).true;
  });
});

describe('respawn', (): void => {
  it('does nothing without a site', async (): Promise<void> => {
    const { game, log } = await setUp();

    expect(
      respawn(game, new Player(game.rules), {
        site: () => null,
        isHuman: () => false,
        inherits: () => true,
      })
    ).equal(null);
    expect(game.players.entries()).eql([]);
    expect(log).eql([]);
  });

  it('brings a new player in at the site, with what it inherits, its units, then the event', async (): Promise<void> => {
    const { game, log, starting, world } = await setUp(),
      [a, b] = [0, 1].map(() => addPlayerHoldingOff(game, world, [])),
      defeated = new Player(game.rules),
      site = world.get(3, 4),
      asked: (typeof Advance)[] = [];

    starting.length = 0;
    [Pottery, Writing].forEach((AdvanceType) =>
      game.playerResearch.getByPlayer(a).addAdvance(AdvanceType)
    );
    [Writing, Pottery, Masonry].forEach((AdvanceType) =>
      game.playerResearch.getByPlayer(b).addAdvance(AdvanceType)
    );

    const player = respawn(game, defeated, {
      site: () => site,
      heldOff: ['test:player/added/starting-advances'],
      isHuman: () => false,
      inherits: (AdvanceType: typeof Advance): boolean => {
        asked.push(AdvanceType);

        return AdvanceType !== Writing;
      },
    })!;

    expect(game.players.entries()).eql([a, b, player]);
    expect(starting).eql([]);
    // What two civilizations know, in the order first met.
    expect(asked).eql([Pottery, Writing]);
    expect(
      game.playerResearch
        .getByPlayer(player)
        .complete()
        .map((advance) => advance.sourceClass())
    ).eql([Pottery]);
    expect(log).eql(['spawn 3,4', 'respawned, new player']);
  });

  it('takes the advances a ruleset offers instead, when it says', async (): Promise<void> => {
    const { game, world } = await setUp(),
      player = respawn(game, new Player(game.rules), {
        site: () => world.get(0, 0),
        isHuman: () => false,
        advances: () => [Masonry],
        inherits: () => true,
      })!;

    expect(game.playerResearch.getByPlayer(player).completed(Masonry)).true;
  });

  it('is switched off with the rule that calls it, by a rule set a game setting can turn off', async (): Promise<void> => {
    const { game, world } = await setUp(),
      comeBack = new Defeated(
        'test:player/defeated/respawn',
        new Criterion((player: Player): boolean =>
          respawns(player, game.rules)
        ),
        new Effect((player: Player): void => {
          respawn(game, player, {
            site: () => world.get(0, 0),
            isHuman: () => false,
            inherits: () => false,
          });
        })
      );

    game.rules.register(comeBack);
    game.ruleSets.register(
      new RuleSet('test:respawn', 'test:player/defeated/respawn')
    );

    game.rules.process(Defeated, new Player(game.rules));

    expect(game.players.length).equal(1);

    game.ruleSets.set('test:respawn', false);
    game.rules.process(Defeated, new Player(game.rules));

    expect(game.players.length).equal(1);

    game.ruleSets.set('test:respawn', true);
    game.rules.process(Defeated, new Player(game.rules));

    expect(game.players.length).equal(2);
  });
});
