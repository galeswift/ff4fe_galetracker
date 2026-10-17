import { KeyItem } from '../data/keyItems';
import {
    CHARACTER_LOCATIONS, CharacterCheck, KEY_ITEM_LOCATIONS, KeyItemCheck, TRAPPED_CHEST_LOCATIONS, Trap,
} from '../data/locations';

// Pure port of fftracker's ApplyChecks(): which locations are hidden by flags, which are reachable
// with the current key items, and which have been checked.

export function hasKeyItem(state, keyItem) {
    return state.keyItems[keyItem] >= 1;
}

export function buildAccessContext(state, flags) {
    const has = (keyItem) => hasKeyItem(state, keyItem);
    const pushB = flags.pushBToJump;
    const hookClear = Boolean(state.keyItemChecks[KeyItemCheck.HOOK_ROUTE]);
    return {
        has,
        pushB,
        hookClear,
        mist: state.mist,
        underworld: has(KeyItem.MAGMA_KEY) || ((has(KeyItem.HOOK) || pushB) && hookClear),
    };
}

export function hiddenKeyItemLocations(flags, settings) {
    const hidden = new Set();
    if (!flags.keyItems.summon) {
        [KeyItemCheck.BARON_ODIN, KeyItemCheck.FEY_ASURA, KeyItemCheck.FEY_LEVIATHAN, KeyItemCheck.SYLPH_CAVE, KeyItemCheck.BAHAMUT]
            .forEach((id) => hidden.add(id));
    }
    if (!flags.keyItems.moon) {
        [KeyItemCheck.MOON_CRYSTAL, KeyItemCheck.MOON_MASAMUNE, KeyItemCheck.MOON_MURASAME, KeyItemCheck.MOON_RIBBON, KeyItemCheck.MOON_WHITE]
            .forEach((id) => hidden.add(id));
    }
    // Knofree moves Toroia's free key item to Mist Village.
    hidden.add(flags.keyItems.noFree ? KeyItemCheck.TOROIA : KeyItemCheck.MIST);
    if (!flags.keyItems.forge) {
        hidden.add(KeyItemCheck.FORGE);
    }
    if (!settings.locationLogic) {
        hidden.add(KeyItemCheck.HOOK_ROUTE);
    }
    return hidden;
}

export function hiddenCharacterLocations(flags) {
    const hidden = new Set();
    if (flags.characters.noFree) {
        [CharacterCheck.DAMCYAN, CharacterCheck.MT_ORDEALS, CharacterCheck.MYSIDIA, CharacterCheck.WATERWAY]
            .forEach((id) => hidden.add(id));
    }
    if (flags.characters.noEarned) {
        [CharacterCheck.MIST, CharacterCheck.KAIPO, CharacterCheck.MT_HOBS, CharacterCheck.BARON_CASTLE, CharacterCheck.BARON_INN,
            CharacterCheck.TOWER_ZOT, CharacterCheck.DWARF, CharacterCheck.EBLAN_CAVE, CharacterCheck.MOON, CharacterCheck.GIANT_BABIL]
            .forEach((id) => hidden.add(id));
    }
    if (flags.characters.noGiant) {
        hidden.add(CharacterCheck.GIANT_BABIL);
    }
    return hidden;
}

// Plain Kmiab (or 4.x Ktrap) includes every trapped chest, with Lunar Sub. only alongside Kmoon.
// 5.0 Kmiab:above/below/lst/all picks zones.
export function hiddenTrapLocations(flags) {
    const { miab } = flags.keyItems;
    if (miab instanceof Set) {
        return new Set(TRAPPED_CHEST_LOCATIONS.filter((l) => !miab.has(l.zone)).map((l) => l.id));
    }
    return flags.keyItems.moon ? new Set() : new Set([Trap.MOON_SUB]);
}

export function showTrapChests(flags) {
    return flags.keyItems.miab !== null;
}

// Cwishes moves every character to Mysidia's Tower of Wishes.
export function showCharacterLocations(flags) {
    return !flags.characters.wishes;
}

// Builds one column's entries. `isChecked(location)` comes from the column's own state.
function listColumn(locations, hidden, isChecked, ctx, settings) {
    return locations
        .filter((location) => !hidden.has(location.id))
        .map((location) => ({
            ...location,
            checked: isChecked(location),
            available: !settings.locationLogic || location.requires(ctx),
        }));
}

export function keyItemLocationList(state, flags, settings) {
    const ctx = buildAccessContext(state, flags);
    return listColumn(KEY_ITEM_LOCATIONS, hiddenKeyItemLocations(flags, settings),
        (location) => Boolean(state.keyItemChecks[location.id]), ctx, settings)
        .map((location) => ({ ...location, timestamp: state.keyItemChecks[location.id]?.time ?? null }));
}

export function characterLocationList(state, flags, settings) {
    const ctx = buildAccessContext(state, flags);
    return listColumn(CHARACTER_LOCATIONS, hiddenCharacterLocations(flags),
        (location) => Boolean(state.characterChecks[location.id]), ctx, settings);
}

export function trapLocationList(state, flags, settings) {
    const ctx = buildAccessContext(state, flags);
    return listColumn(TRAPPED_CHEST_LOCATIONS, hiddenTrapLocations(flags),
        (location) => remainingTrapChests(state, location) === 0, ctx, settings)
        .map((location) => ({ ...location, remaining: remainingTrapChests(state, location) }));
}

export function remainingTrapChests(state, location) {
    return state.trapCounts[location.id] ?? location.count;
}

// With the warp glitch allowed, clearing Dwarf Castle asks whether the warp was used to skip Sealed Cave.
export function showWarpGlitchPrompt(state, flags, settings) {
    return flags.warpGlitch && settings.locationLogic
        && Boolean(state.keyItemChecks[KeyItemCheck.DWARF]) && state.warpGlitch === null;
}

export function isCecilPaladin(state) {
    return Boolean(state.keyItemChecks[KeyItemCheck.MT_ORDEALS]);
}

export function isRydiaAdult(state) {
    return Boolean(state.characterChecks[CharacterCheck.DWARF] || state.keyItemChecks[KeyItemCheck.DWARF]);
}
