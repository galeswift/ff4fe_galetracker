import { KeyItem } from './keyItems';

// Objective ids match fftracker's objective indices (0-89).
// `key` is the name used in O flags (e.g. O1:quest_forge), `requires` lists the key items
// the objective needs, used for Go Mode.
export const ObjectiveCategory = Object.freeze({
    MODE: 'mode',
    CHARACTER: 'character',
    BOSS: 'boss',
    QUEST: 'quest',
});

const { BARON_KEY, LUCA_KEY, MAGMA_KEY, TOWER_KEY, DARKNESS_CRYSTAL, EARTH_CRYSTAL, HOOK, TWINHARP,
    PACKAGE, PAN, SANDRUBY, RAT_TAIL, ADAMANT, LEGEND, PINK_TAIL, PASS } = KeyItem;

const MODES = [
    ["classicforge", "Classic Forge the Crystal"],
    ["classicgiant", "Classic Giant"],
    ["fiends", "Fiends"],
    ["dkmatter", "Dark Matter Hunt"],
];

const CHARACTERS = [
    ["char_cecil", "Get Cecil"],
    ["char_kain", "Get Kain"],
    ["char_rydia", "Get Rydia"],
    ["char_tellah", "Get Tellah"],
    ["char_edward", "Get Edward"],
    ["char_rosa", "Get Rosa"],
    ["char_yang", "Get Yang"],
    ["char_palom", "Get Palom"],
    ["char_porom", "Get Porom"],
    ["char_cid", "Get Cid"],
    ["char_edge", "Get Edge"],
    ["char_fusoya", "Get FuSoYa"],
];

const BOSSES = [
    ["boss_dmist", "Defeat D.Mist"],
    ["boss_officer", "Defeat Officer"],
    ["boss_octomamm", "Defeat Octomamm"],
    ["boss_antlion", "Defeat Antlion"],
    ["boss_waterhag", "Defeat Waterhag (boss version)"],
    ["boss_mombomb", "Defeat MomBomb"],
    ["boss_fabulgauntlet", "Defeat the Fabul Gauntlet"],
    ["boss_milon", "Defeat Milon"],
    ["boss_milonz", "Defeat Milon Z."],
    ["boss_mirrorcecil", "Defeat D.Knight"],
    ["boss_guard", "Defeat the Guards (boss)"],
    ["boss_karate", "Defeat Karate"],
    ["boss_baigan", "Defeat Baigan"],
    ["boss_kainazzo", "Defeat Kainazzo"],
    ["boss_darkelf", "Defeat the Dark Elf (dragon form)"],
    ["boss_magus", "Defeat the Magus Sisters"],
    ["boss_valvalis", "Defeat Valvalis"],
    ["boss_calbrena", "Defeat Calbrena"],
    ["boss_golbez", "Defeat Golbez"],
    ["boss_lugae", "Defeat Dr. Lugae"],
    ["boss_darkimp", "Defeat the Dark Imps (boss)"],
    ["boss_kingqueen", "Defeat K.Eblan and Q.Eblan"],
    ["boss_rubicant", "Defeat Rubicant"],
    ["boss_evilwall", "Defeat EvilWall"],
    ["boss_asura", "Defeat Asura"],
    ["boss_leviatan", "Defeat Leviatan"],
    ["boss_odin", "Defeat Odin"],
    ["boss_bahamut", "Defeat Bahamut"],
    ["boss_elements", "Defeat Elements"],
    ["boss_cpu", "Defeat CPU"],
    ["boss_paledim", "Defeat Pale Dim"],
    ["boss_wyvern", "Defeat Wyvern"],
    ["boss_plague", "Defeat Plague"],
    ["boss_dlunar", "Defeat the D.Lunars"],
    ["boss_ogopogo", "Defeat Ogopogo"],
];

const QUESTS = [
    ["quest_mistcave", "Defeat the boss of the Mist Cave"],
    ["quest_waterfall", "Defeat the boss of the Waterfall"],
    ["quest_antlionnest", "Complete the Antlion Nest"],
    ["quest_hobs", "Rescue the hostage on Mt. Hobs"],
    ["quest_fabul", "Defend Fabul"],
    ["quest_ordeals", "Complete Mt. Ordeals"],
    ["quest_baroninn", "Defeat the bosses of Baron Inn"],
    ["quest_baroncastle", "Liberate Baron Castle", [BARON_KEY]],
    ["quest_magnes", "Complete Cave Magnes", [TWINHARP]],
    ["quest_zot", "Complete the Tower of Zot", [EARTH_CRYSTAL]],
    ["quest_dwarfcastle", "Defeat the bosses of Dwarf Castle", [HOOK, MAGMA_KEY]],
    ["quest_lowerbabil", "Defeat the boss of Lower Bab-il", [HOOK, MAGMA_KEY]],
    ["quest_falcon", "Launch the Falcon", [HOOK]],
    ["quest_sealedcave", "Complete the Sealed Cave", [LUCA_KEY, HOOK, MAGMA_KEY]],
    ["quest_monsterqueen", "Defeat the queen at the Town of Monsters", [HOOK, MAGMA_KEY]],
    ["quest_monsterking", "Defeat the king at the Town of Monsters", [HOOK, MAGMA_KEY]],
    ["quest_baronbasement", "Defeat the Baron Castle basement throne", [BARON_KEY]],
    ["quest_giant", "Complete the Giant of Bab-il", [DARKNESS_CRYSTAL]],
    ["quest_cavebahamut", "Complete Cave Bahamut", [DARKNESS_CRYSTAL]],
    ["quest_murasamealtar", "Conquer the vanilla Murasame altar", [DARKNESS_CRYSTAL]],
    ["quest_crystalaltar", "Conquer the vanilla Crystal Sword altar", [DARKNESS_CRYSTAL]],
    ["quest_whitealtar", "Conquer the vanilla White Spear altar", [DARKNESS_CRYSTAL]],
    ["quest_ribbonaltar", "Conquer the vanilla Ribbon room", [DARKNESS_CRYSTAL]],
    ["quest_masamunealtar", "Conquer the vanilla Masamune altar", [DARKNESS_CRYSTAL]],
    ["quest_burnmist", "Burn village Mist with the Package", [PACKAGE]],
    ["quest_curefever", "Cure the fever with the SandRuby", [SANDRUBY]],
    ["quest_unlocksewer", "Unlock the sewer with the Baron Key", [BARON_KEY]],
    ["quest_music", "Break the Dark Elf's spell with the TwinHarp", [TWINHARP]],
    ["quest_toroiatreasury", "Open the Toroia treasury with the Earth Crystal", [EARTH_CRYSTAL]],
    ["quest_magma", "Drop the Magma Key into the Agart well", [MAGMA_KEY]],
    ["quest_supercannon", "Destroy the Super Cannon", [TOWER_KEY, HOOK, MAGMA_KEY]],
    ["quest_unlocksealedcave", "Unlock the Sealed Cave", [LUCA_KEY, HOOK, MAGMA_KEY]],
    ["quest_bigwhale", "Raise the Big Whale", [DARKNESS_CRYSTAL]],
    ["quest_traderat", "Trade away the Rat Tail", [RAT_TAIL, HOOK]],
    ["quest_forge", "Have Kokkol forge Legend Sword with Adamant", [LEGEND, ADAMANT, HOOK, MAGMA_KEY]],
    ["quest_wakeyang", "Wake Yang with the Pan", [PAN, HOOK, MAGMA_KEY]],
    ["quest_tradepan", "Return the Pan to Yang's wife", [PAN, HOOK, MAGMA_KEY]],
    ["quest_tradepink", "Trade away the Pink Tail", [PINK_TAIL, HOOK]],
    ["quest_pass", "Unlock the Pass door in Toroia", [PASS]],
    // 5.0
    ["quest_kaipoinn", "Bring the Mist Village survivor to Kaipo", [PACKAGE]],
];

export const OBJECTIVES = [
    ...MODES.map(([key, name]) => ({ key, name, category: ObjectiveCategory.MODE })),
    ...CHARACTERS.map(([key, name]) => ({ key, name, category: ObjectiveCategory.CHARACTER })),
    ...BOSSES.map(([key, name]) => ({ key, name, category: ObjectiveCategory.BOSS })),
    ...QUESTS.map(([key, name, requires]) => ({ key, name, category: ObjectiveCategory.QUEST, requires })),
    // 4.7 Gale fork's Omode:external
    ...[["internal_external", "Complete external goal and use EagleEye"]].map(([key, name]) => ({ key, name, category: ObjectiveCategory.MODE })),
].map((objective, id) => ({ id, requires: [], ...objective }));

export const ObjectiveId = Object.freeze({
    CLASSIC_FORGE: 0,
    CLASSIC_GIANT: 1,
    DARK_MATTER: 3,
    EXTERNAL: 91,
});

// The Fiends mode enables these six boss objectives.
export const FIEND_OBJECTIVES = ["boss_milon", "boss_milonz", "boss_kainazzo", "boss_valvalis", "boss_rubicant", "boss_elements"]
    .map((key) => OBJECTIVES.find((o) => o.key === key).id);

export const objectiveByKey = (key) => OBJECTIVES.find((o) => o.key === key);

export const MAX_RANDOM_OBJECTIVES = 8;
export const MAX_DARK_MATTER = 99;

// 5.0 Omode_dkmatter:quests: these quests reward DkMatter, and 40 turned in wins.
export const DARK_MATTER_QUESTS = [
    ["quest_baroncastle", 3], ["quest_magnes", 3], ["quest_zot", 3], ["quest_supercannon", 3], ["quest_burnmist", 3],
    ["quest_dwarfcastle", 5], ["quest_sealedcave", 5], ["quest_baronbasement", 5], ["quest_lowerbabil", 5],
    ["quest_falcon", 7], ["quest_monsterking", 7], ["quest_monsterqueen", 7], ["quest_masamunealtar", 7],
    ["quest_giant", 10],
].map(([key, darkMatter]) => ({ id: objectiveByKey(key).id, darkMatter }));
export const DARK_MATTER_QUEST_TARGET = 40;

// 5.0 "collect" objectives, e.g. collect_ki10 or collect_gp250. Each kind shares one counter.
export const CollectKind = Object.freeze({
    KEY_ITEMS: 'ki',
    BOSSES: 'boss',
    DARK_MATTER: 'dkmatter',
    CHESTS: 'chest',
    GP: 'gp',
});

export function parseCollectObjective(key) {
    const match = key.match(/^collect_(ki|boss|dkmatter|chest|gp)(\d+)$/);
    return match ? { kind: match[1], target: Number(match[2]) } : null;
}

export function collectObjectiveName({ kind, target }) {
    switch (kind) {
        case CollectKind.KEY_ITEMS: return `Collect ${target} Different Key Items`;
        case CollectKind.BOSSES: return `Defeat Any ${target} Bosses`;
        case CollectKind.DARK_MATTER: return `Bring ${target} DkMatter to Kory in Agart`;
        case CollectKind.CHESTS: return `Open ${target} Treasure Chests`;
        case CollectKind.GP: return `Bring ${(target * 1000).toLocaleString('en-US')} GP to Tory in Agart`;
        default: return `Collect ${target}`;
    }
}
