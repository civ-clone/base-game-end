# base-game-end

The parts of how a game ends that rulesets share. Each is a plain function, so the ruleset keeps its own rule ids,
numbers and registration:

- `lib/byLevel`: `byLevel(atLevel0, perLevel)`, a `(level) => number` for a number that moves with the difficulty
  level, such as the last year or the last turn a destroyed civilization comes back on.
- `lib/civilizations`: `civilizations(players)`, everyone but the barbarians.
- `lib/conquest`: `isConquest(playerRegistry, playerWorldRegistry)` (one civilization left of a game that started
  with more), `conqueror(playerRegistry)`, and `conquestBonusFor(player, gameResultRegistry, playerWorldRegistry,
  bonus)`, which scores `bonus(turn, opponents)` for the winner of a conquest and `null` otherwise.
- `lib/year`: `yearReached(year, turn, target)` for the last year, and `yearCrossed(year, turn, target)` for a one-off
  warning before it.
- `lib/inheritedAdvances`: `inheritedAdvances(players, isHuman, completed)`, what a civilization coming back may
  inherit.

A library: it registers no rules. See `civ1-game-end` for Civilization's.
