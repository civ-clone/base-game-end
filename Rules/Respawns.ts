import Player from '@civ-clone/core-player/Player';
import Rule from '@civ-clone/core-rule/Rule';

// Whether a destroyed civilization comes back (`lib/respawn` `respawns`): every rule must agree. A ruleset numbers it,
//  such as a last turn that moves with the difficulty level (`lib/byLevel`).
export class Respawns extends Rule<[Player], boolean> {}

export default Respawns;
