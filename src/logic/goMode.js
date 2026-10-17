import { KeyItem, MAX_KEY_ITEMS, MAX_KEY_ITEMS_50 } from '../data/keyItems';
import { OBJECTIVES } from '../data/objectives';
import { hasKeyItem } from './availability';
import { activeObjectiveIds } from './objectives';

// Ported from fftracker's RefreshRequiredKeyItems() / SetRequiredKeyItems() and the Go Mode
// section of ApplyChecks().

const REQUIRED = 1;
// Hook or Magma Key needed only as a way into the underworld: either one will do.
const REQUIRED_FOR_UNDERWORLD = 2;

export const KeyItemGoStatus = Object.freeze({ NONE: 'none', MET: 'met', MISSING: 'missing' });

export function requiredKeyItems(objectiveIds) {
    const required = {};
    for (const id of objectiveIds) {
        const keyItems = OBJECTIVES[id].requires;
        const wantsUnderworld = keyItems.includes(KeyItem.HOOK) && keyItems.includes(KeyItem.MAGMA_KEY);
        for (const keyItem of keyItems) {
            const isUnderworldItem = keyItem === KeyItem.HOOK || keyItem === KeyItem.MAGMA_KEY;
            // Don't downgrade an item another objective needs outright.
            required[keyItem] = wantsUnderworld && isUnderworldItem && required[keyItem] !== REQUIRED
                ? REQUIRED_FOR_UNDERWORLD
                : REQUIRED;
        }
    }
    return required;
}

export function goModeStatus(state, flags) {
    const required = requiredKeyItems(activeObjectiveIds(state, flags));
    // Hook or Magma Key is only needed to reach the underworld; -starting:underground already has it.
    const hasUnderworldItem = flags.startUnderground || hasKeyItem(state, KeyItem.HOOK) || hasKeyItem(state, KeyItem.MAGMA_KEY);

    const itemStatus = state.keyItems.map((_, keyItem) => {
        if (!required[keyItem]) return KeyItemGoStatus.NONE;
        if (hasKeyItem(state, keyItem)) return KeyItemGoStatus.MET;
        if (required[keyItem] === REQUIRED_FOR_UNDERWORLD && hasUnderworldItem) return KeyItemGoStatus.NONE;
        return KeyItemGoStatus.MISSING;
    });

    const anyKeyItem = state.keyItems.some((value) => value >= 1);
    return {
        itemStatus,
        inGoMode: anyKeyItem && !itemStatus.includes(KeyItemGoStatus.MISSING),
    };
}

// 5.0 counts the Pass as a key item; 4.x doesn't.
export function maxKeyItems(flags) {
    return flags.version50 ? MAX_KEY_ITEMS_50 : MAX_KEY_ITEMS;
}

export function keyItemCount(state, flags) {
    const count = state.keyItems.filter((value, keyItem) => value >= 1 && (flags.version50 || keyItem !== KeyItem.PASS)).length;
    return Math.min(count, maxKeyItems(flags));
}

// 10+ key items earns the experience bonus unless -exp:nokeybonus is set.
export function hasKeyItemBonus(state, flags) {
    return keyItemCount(state, flags) > 9 && !flags.noKeyBonus;
}
