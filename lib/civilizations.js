"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.civilizations = void 0;
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/** The players that are civilizations: everyone but the barbarians, who neither win a game nor stand in the way. */
const civilizations = (players) => players.filter((player) => !(0, isBarbarian_1.default)(player));
exports.civilizations = civilizations;
exports.default = exports.civilizations;
//# sourceMappingURL=civilizations.js.map