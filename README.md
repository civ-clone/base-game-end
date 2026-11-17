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

- `lib/addPlayerHoldingOff`: `addPlayerHoldingOff(game, world, heldOff, options?)`, `base-player`'s `addPlayer` with
  the rules whose ids are `heldOff` switched off while the player joins (a ruleset's starting advances, say), and back
  on after if they were on. A civilization coming back and a civil war's rebels join this way.
- `lib/respawn`: a destroyed civilization coming back.
  - `respawns(player, ruleRegistry, fallback?)`: whether it does. Every `Respawns` rule (`Rules/Respawns`) that answers must
    agree; when none answers (none registered, or none applies), `fallback()` answers (true if left out). A ruleset registers its gate as a `Respawns` rule,
    such as a last turn by difficulty level (`byLevel`), or keeps its own number and passes it as `fallback`.
  - `respawn(game, defeated, { site, heldOff, isHuman, advances, inherits })`: for the ruleset's `Defeated` rule to
    call. `site()` first (`null`: nothing happens); then the player joins with `heldOff` held off; then each advance
    it may inherit (`advances(others, player)`, by default `inheritedAdvances`) is added where `inherits` says; then
    the `Spawn` rules give it its units at the site; then `player:respawned` is emitted with the new player and the
    destroyed one. The site search, the units and the chances stay the ruleset's.
  - **A game setting to switch it off:** put the id of the `Defeated` rule that calls `respawn` in a `RuleSet` (on by
    default), which New Game offers; switching the set off switches the rule off. Switching a `Respawns` rule off
    would let civilizations come back, not stop them.

A library: it registers no rules. See `civ1-game-end` for Civilization's.
