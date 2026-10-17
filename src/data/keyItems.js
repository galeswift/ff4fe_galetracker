// Key item ids match fftracker's KeyItem enum so the logic ports one-to-one.
export const KeyItem = Object.freeze({
    BARON_KEY: 0,
    LUCA_KEY: 1,
    MAGMA_KEY: 2,
    TOWER_KEY: 3,
    DARKNESS_CRYSTAL: 4,
    EARTH_CRYSTAL: 5,
    HOOK: 6,
    TWINHARP: 7,
    PACKAGE: 8,
    PAN: 9,
    SANDRUBY: 10,
    RAT_TAIL: 11,
    ADAMANT: 12,
    LEGEND: 13,
    SPOON: 14,
    PINK_TAIL: 15,
    CRYSTAL: 16,
    PASS: 17,
});

export const KEY_ITEMS = [
    { id: KeyItem.BARON_KEY, name: "Baron Key", image: "images/ki_baronkey.png" },
    { id: KeyItem.LUCA_KEY, name: "Luca Key", image: "images/ki_lucakey.png" },
    { id: KeyItem.MAGMA_KEY, name: "Magma Key", image: "images/ki_magmakey.png" },
    { id: KeyItem.TOWER_KEY, name: "Tower Key", image: "images/ki_towerkey.png" },
    { id: KeyItem.DARKNESS_CRYSTAL, name: "Darkness Crystal", image: "images/ki_dark.png" },
    { id: KeyItem.EARTH_CRYSTAL, name: "Earth Crystal", image: "images/ki_earth.png" },
    { id: KeyItem.HOOK, name: "Hook", image: "images/ki_hook.png" },
    { id: KeyItem.TWINHARP, name: "Twinharp", image: "images/ki_harp.png" },
    { id: KeyItem.PACKAGE, name: "Package", image: "images/ki_package.png" },
    { id: KeyItem.PAN, name: "Pan", image: "images/ki_Pan.png" },
    { id: KeyItem.SANDRUBY, name: "Sandruby", image: "images/ki_sandruby.png" },
    { id: KeyItem.RAT_TAIL, name: "Rat Tail", image: "images/ki_rattail.png" },
    { id: KeyItem.ADAMANT, name: "Adamant", image: "images/ki_adamant.png" },
    { id: KeyItem.LEGEND, name: "Legend Sword", image: "images/ki_legend.png" },
    { id: KeyItem.SPOON, name: "Spoon", image: "images/ki_spoon.png" },
    { id: KeyItem.PINK_TAIL, name: "Pink Tail", image: "images/ki_pinktail.png" },
    { id: KeyItem.CRYSTAL, name: "Crystal", image: "images/ki_crystal.png" },
    { id: KeyItem.PASS, name: "Pass", image: "images/ki_pass.png" },
];

// Key item states cycle on click: not found -> found -> used.
export const KeyItemState = Object.freeze({ NONE: 0, FOUND: 1, USED: 2 });

// Before 5.0 the Pass doesn't count toward the key item total; in 5.0 it does.
export const MAX_KEY_ITEMS = 17;
export const MAX_KEY_ITEMS_50 = 18;

// Names used by 5.0's Kstart: flag ("zonk" means no key item).
export const KEY_ITEM_START_NAMES = {
    BARONKEY: KeyItem.BARON_KEY,
    LUCAKEY: KeyItem.LUCA_KEY,
    MAGMAKEY: KeyItem.MAGMA_KEY,
    TOWERKEY: KeyItem.TOWER_KEY,
    DARKNESS: KeyItem.DARKNESS_CRYSTAL,
    EARTHCRYSTAL: KeyItem.EARTH_CRYSTAL,
    HOOK: KeyItem.HOOK,
    TWINHARP: KeyItem.TWINHARP,
    PACKAGE: KeyItem.PACKAGE,
    PAN: KeyItem.PAN,
    SANDRUBY: KeyItem.SANDRUBY,
    RATTAIL: KeyItem.RAT_TAIL,
    ADAMANT: KeyItem.ADAMANT,
    LEGEND: KeyItem.LEGEND,
    SPOON: KeyItem.SPOON,
    PINKTAIL: KeyItem.PINK_TAIL,
    CRYSTAL: KeyItem.CRYSTAL,
    PASS: KeyItem.PASS,
};
