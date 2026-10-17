import { KeyItem } from './keyItems';

// Ids match fftracker's KeyItemCheck / CharacterCheck / Trap enums.
export const KeyItemCheck = Object.freeze({
    ADAMANT: 0,
    ANTLION: 1,
    BARON_KING: 2,
    BARON_ODIN: 3,
    BARON_INN: 4,
    FABUL_DEFEND: 5,
    FABUL_SYLPH: 6,
    FABUL_PAN: 7,
    MAGNES: 8,
    MIST: 9,
    MT_ORDEALS: 10,
    TOWER_ZOT: 11,
    TOROIA: 12,
    DWARF: 13,
    FEY_CHEST: 14,
    FEY_ASURA: 15,
    FEY_LEVIATHAN: 16,
    LOWER_BABIL_BOSS: 17,
    LOWER_BABIL_CANNON: 18,
    SEALED_CAVE: 19,
    SYLPH_CAVE: 20,
    BAHAMUT: 21,
    MOON_CRYSTAL: 22,
    MOON_MASAMUNE: 23,
    MOON_MURASAME: 24,
    MOON_RIBBON: 25,
    MOON_WHITE: 26,
    HOOK_ROUTE: 27,
    // 5.0 Kforge
    FORGE: 28,
});

export const CharacterCheck = Object.freeze({
    BARON_CASTLE: 0,
    BARON_INN: 1,
    DAMCYAN: 2,
    EBLAN_CAVE: 3,
    GIANT_BABIL: 4,
    KAIPO: 5,
    MIST: 6,
    MT_HOBS: 7,
    MT_ORDEALS: 8,
    MYSIDIA: 9,
    TOWER_ZOT: 10,
    WATERWAY: 11,
    DWARF: 12,
    MOON: 13,
});

export const Trap = Object.freeze({
    CASTLE_EBLAN: 0,
    EBLAN_CAVE: 1,
    GIANT_BABIL: 2,
    TOWER_ZOT: 3,
    UPPER_BABIL: 4,
    FEY: 5,
    LOWER_BABIL: 6,
    SYLPH_CAVE: 7,
    MOON_PATH: 8,
    MOON_SUB: 9,
});

export const Region = Object.freeze({
    OVERWORLD: 'overworld',
    OVER_UNDER: 'overunder',
    UNDERWORLD: 'underworld',
    MOON: 'moon',
});

// Each `requires` receives the access context built in logic/availability.js:
//   ctx.has(keyItem), ctx.underworld, ctx.pushB, ctx.hookClear, ctx.mist
const always = () => true;
const baronKey = (ctx) => ctx.has(KeyItem.BARON_KEY) || ctx.pushB;
const hook = (ctx) => ctx.has(KeyItem.HOOK) || ctx.pushB;
const earthCrystal = (ctx) => ctx.has(KeyItem.EARTH_CRYSTAL) || ctx.pushB;
const underworld = (ctx) => ctx.underworld;
const darkCrystal = (ctx) => ctx.has(KeyItem.DARKNESS_CRYSTAL);

// Listed in display order (fftracker shows Toroia before Zot, and Hook Route between the overworld and underworld).
export const KEY_ITEM_LOCATIONS = [
    { id: KeyItemCheck.ADAMANT, name: "Adamant Cave", region: Region.OVERWORLD, requires: (ctx) => ctx.has(KeyItem.HOOK) && ctx.has(KeyItem.RAT_TAIL) },
    { id: KeyItemCheck.ANTLION, name: "Antlion Cave", region: Region.OVERWORLD, requires: always },
    { id: KeyItemCheck.BARON_KING, name: "Baron Castle [King]", region: Region.OVERWORLD, requires: baronKey },
    { id: KeyItemCheck.BARON_ODIN, name: "Baron Castle [Odin]", region: Region.OVERWORLD, requires: baronKey },
    { id: KeyItemCheck.BARON_INN, name: "Town of Baron", region: Region.OVERWORLD, requires: always },
    { id: KeyItemCheck.FABUL_DEFEND, name: "Fabul [Defend]", region: Region.OVERWORLD, requires: always },
    { id: KeyItemCheck.MAGNES, name: "Magnes Cave", region: Region.OVERWORLD, requires: (ctx) => ctx.has(KeyItem.TWINHARP) || ctx.pushB },
    { id: KeyItemCheck.MIST, name: "Mist Village", region: Region.OVERWORLD, requires: (ctx) => ctx.mist },
    { id: KeyItemCheck.MT_ORDEALS, name: "Mt Ordeals", region: Region.OVERWORLD, requires: always },
    { id: KeyItemCheck.TOROIA, name: "Toroia Castle", region: Region.OVERWORLD, requires: always },
    { id: KeyItemCheck.TOWER_ZOT, name: "Tower of Zot", region: Region.OVERWORLD, requires: earthCrystal },
    { id: KeyItemCheck.HOOK_ROUTE, name: "Clear Hook Route", region: Region.OVER_UNDER, requires: (ctx) => hook(ctx) && !ctx.has(KeyItem.MAGMA_KEY) && !ctx.hookClear },
    { id: KeyItemCheck.DWARF, name: "Dwarf Castle", region: Region.UNDERWORLD, requires: underworld },
    { id: KeyItemCheck.FORGE, name: "Kokkol's Forge", region: Region.UNDERWORLD, requires: (ctx) => ctx.has(KeyItem.LEGEND) && ctx.has(KeyItem.ADAMANT) && ctx.underworld },
    { id: KeyItemCheck.FABUL_SYLPH, name: "Fabul [Sheila/Sylph]", region: Region.UNDERWORLD, requires: underworld },
    { id: KeyItemCheck.FABUL_PAN, name: "Fabul [Sheila/Pan]", region: Region.UNDERWORLD, requires: (ctx) => ctx.has(KeyItem.PAN) && ctx.underworld },
    { id: KeyItemCheck.FEY_CHEST, name: "Feymarch [Chest]", region: Region.UNDERWORLD, requires: underworld },
    { id: KeyItemCheck.FEY_ASURA, name: "Feymarch [Asura]", region: Region.UNDERWORLD, requires: underworld },
    { id: KeyItemCheck.FEY_LEVIATHAN, name: "Feymarch [Leviathan]", region: Region.UNDERWORLD, requires: underworld },
    { id: KeyItemCheck.LOWER_BABIL_BOSS, name: "Lower Babil [Boss]", region: Region.UNDERWORLD, requires: underworld },
    { id: KeyItemCheck.LOWER_BABIL_CANNON, name: "Lower Babil [Cannon]", region: Region.UNDERWORLD, requires: (ctx) => ctx.has(KeyItem.TOWER_KEY) && ctx.underworld },
    { id: KeyItemCheck.SEALED_CAVE, name: "Sealed Cave", region: Region.UNDERWORLD, requires: (ctx) => ctx.has(KeyItem.LUCA_KEY) && ctx.underworld },
    { id: KeyItemCheck.SYLPH_CAVE, name: "Sylph Cave", region: Region.UNDERWORLD, requires: (ctx) => ctx.has(KeyItem.PAN) && ctx.underworld },
    { id: KeyItemCheck.BAHAMUT, name: "Bahamut", region: Region.MOON, requires: darkCrystal },
    { id: KeyItemCheck.MOON_CRYSTAL, name: "Lunar [Crystal]", region: Region.MOON, requires: darkCrystal },
    { id: KeyItemCheck.MOON_MASAMUNE, name: "Lunar [Masamune]", region: Region.MOON, requires: darkCrystal },
    { id: KeyItemCheck.MOON_MURASAME, name: "Lunar [Murasame]", region: Region.MOON, requires: darkCrystal },
    { id: KeyItemCheck.MOON_RIBBON, name: "Lunar [Ribbon]", region: Region.MOON, requires: darkCrystal },
    { id: KeyItemCheck.MOON_WHITE, name: "Lunar [White]", region: Region.MOON, requires: darkCrystal },
];

export const CHARACTER_LOCATIONS = [
    { id: CharacterCheck.BARON_CASTLE, name: "Baron Castle", region: Region.OVERWORLD, requires: baronKey },
    { id: CharacterCheck.BARON_INN, name: "Town of Baron", region: Region.OVERWORLD, requires: always },
    { id: CharacterCheck.DAMCYAN, name: "Damcyan", region: Region.OVERWORLD, requires: always },
    { id: CharacterCheck.EBLAN_CAVE, name: "Eblan Cave", region: Region.OVERWORLD, requires: hook },
    { id: CharacterCheck.GIANT_BABIL, name: "Giant of Babil", region: Region.OVERWORLD, requires: darkCrystal },
    { id: CharacterCheck.KAIPO, name: "Kaipo", region: Region.OVERWORLD, requires: (ctx) => ctx.has(KeyItem.SANDRUBY) },
    { id: CharacterCheck.MIST, name: "Mist Village", region: Region.OVERWORLD, requires: (ctx) => ctx.has(KeyItem.PACKAGE) },
    { id: CharacterCheck.MT_HOBS, name: "Mt Hobbs", region: Region.OVERWORLD, requires: always },
    { id: CharacterCheck.MT_ORDEALS, name: "Mt Ordeals", region: Region.OVERWORLD, requires: always },
    { id: CharacterCheck.MYSIDIA, name: "Mysidia", region: Region.OVERWORLD, requires: always },
    { id: CharacterCheck.TOWER_ZOT, name: "Tower of Zot", region: Region.OVERWORLD, requires: earthCrystal },
    { id: CharacterCheck.WATERWAY, name: "Waterway", region: Region.OVERWORLD, requires: always },
    { id: CharacterCheck.DWARF, name: "Dwarf Castle", region: Region.UNDERWORLD, requires: underworld },
    { id: CharacterCheck.MOON, name: "Lunar Sub.", region: Region.MOON, requires: darkCrystal },
];

// Kmiab zones (5.0): above = overworld, Lunar Path and Giant; below = underworld; lst = Lunar Subterrane.
export const MiabZone = Object.freeze({ ABOVE: 'above', BELOW: 'below', LST: 'lst' });

export const TRAPPED_CHEST_LOCATIONS = [
    { id: Trap.CASTLE_EBLAN, name: "Castle Eblan", zone: MiabZone.ABOVE, count: 3, region: Region.OVERWORLD, requires: always },
    { id: Trap.EBLAN_CAVE, name: "Eblan Cave", zone: MiabZone.ABOVE, count: 1, region: Region.OVERWORLD, requires: hook },
    { id: Trap.GIANT_BABIL, name: "Giant of Babil", zone: MiabZone.ABOVE, count: 1, region: Region.OVERWORLD, requires: darkCrystal },
    { id: Trap.TOWER_ZOT, name: "Tower of Zot", zone: MiabZone.ABOVE, count: 1, region: Region.OVERWORLD, requires: always },
    { id: Trap.UPPER_BABIL, name: "Upper Babil", zone: MiabZone.ABOVE, count: 1, region: Region.OVERWORLD, requires: hook },
    { id: Trap.FEY, name: "Feymarch", zone: MiabZone.BELOW, count: 1, region: Region.UNDERWORLD, requires: underworld },
    { id: Trap.LOWER_BABIL, name: "Lower Babil", zone: MiabZone.BELOW, count: 4, region: Region.UNDERWORLD, requires: underworld },
    { id: Trap.SYLPH_CAVE, name: "Sylph Cave", zone: MiabZone.BELOW, count: 7, region: Region.UNDERWORLD, requires: underworld },
    { id: Trap.MOON_PATH, name: "Lunar Path", zone: MiabZone.ABOVE, count: 1, region: Region.MOON, requires: darkCrystal },
    { id: Trap.MOON_SUB, name: "Lunar Sub.", zone: MiabZone.LST, count: 9, region: Region.MOON, requires: darkCrystal },
];
