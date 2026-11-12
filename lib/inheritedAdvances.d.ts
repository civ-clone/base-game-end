/**
 * The advances a civilization coming back may inherit: with a person playing, what a human knows that another
 * civilization also knows; with no human seat, what any two civilizations know (common knowledge, as the first rule
 * means it to be, since with no human it would always be empty). The ruleset decides what each is worth, such as an
 * even chance of each.
 *
 * `players` are the civilizations in the game other than the one coming back; `completed` says what each knows.
 * Each advance comes back once, in the order first met.
 */
export declare const inheritedAdvances: <P, A>(
  players: P[],
  isHuman: (player: P) => boolean,
  completed: (player: P) => A[]
) => A[];
export default inheritedAdvances;
