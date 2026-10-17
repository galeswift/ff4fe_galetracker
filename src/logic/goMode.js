import { KeyItem, MAX_KEY_ITEMS, MAX_KEY_ITEMS_50 } from '../data/keyItems';
import { CollectKind, DARK_MATTER_QUESTS, DARK_MATTER_QUEST_TARGET, OBJECTIVES } from '../data/objectives';
import { hasKeyItem } from './availability';
import { ObjectiveItemKind } from './flags';
import { activeObjectiveIds } from './objectives';

// Go Mode: with the key items you hold right now, can you finish the seed without finding any
// more? That means enough objectives to earn the win (counting hard-required ones) whose key
// items you already have, plus a way to Zeromus when the reward is the Crystal. Whether an
// objective has been completed doesn't matter.

export const KeyItemGoStatus = Object.freeze({ NONE: 'none', MET: 'met', MISSING: 'missing' });

// Objectives listing both the Hook and the Magma Key only need a way into the underworld.
function wantsUnderworld(keyItems) {
    return keyItems.includes(KeyItem.HOOK) && keyItems.includes(KeyItem.MAGMA_KEY);
}

function makeHas(state, flags) {
    const has = (keyItem) => hasKeyItem(state, keyItem);
    const hasUnderworld = flags.startUnderground || has(KeyItem.HOOK) || has(KeyItem.MAGMA_KEY);
    return { has, hasUnderworld };
}

// Whether an objective needs no key items beyond what you hold. Boss and character hunts have no
// known key item requirements, so they always count.
function objectiveDoable(id, { has, hasUnderworld }) {
    const keyItems = OBJECTIVES[id].requires;
    const underworld = wantsUnderworld(keyItems);
    return keyItems.every((keyItem) => (underworld && (keyItem === KeyItem.HOOK || keyItem === KeyItem.MAGMA_KEY)
        ? hasUnderworld
        : has(keyItem)));
}

// Which of each group's rewards are reachable with the current key items.
function reachableRewards(state, flags, haves, keyItemTotal) {
    const doableCount = {};
    const total = {};
    const reachable = [];

    for (const group of flags.objectives.groups) {
        const random = state.objectives.random[group.id] ?? [];
        const doable = group.items.map((item) => {
            if (item.kind === ObjectiveItemKind.OBJECTIVE) return objectiveDoable(item.id, haves);
            if (item.kind === ObjectiveItemKind.COLLECT) return item.counter !== CollectKind.KEY_ITEMS || keyItemTotal >= item.target;
            // "Complete N from group X": possible when that group can reach N.
            const needed = item.count === 'all' ? total[item.group] : item.count;
            return doableCount[item.group] !== undefined && doableCount[item.group] >= needed;
        });
        // An unset random slot could be anything, so it doesn't count.
        const randomDoable = random.map((id) => id !== null && objectiveDoable(id, haves));

        const count = doable.filter(Boolean).length + randomDoable.filter(Boolean).length;
        const hardRequiredOk = group.items.every((item, i) => !item.hardRequired || doable[i]);
        doableCount[group.id] = count;
        total[group.id] = group.items.length + random.length;

        for (const { at, reward } of group.rewards) {
            const needed = at === 'all' ? total[group.id] : at;
            if (hardRequiredOk && count >= needed) reachable.push(reward);
        }
    }

    // Omode_dkmatter:quests: the DkMatter from doable quests has to reach 40.
    if (flags.objectives.darkMatterQuests && flags.objectives.darkMatterWin) {
        const darkMatter = DARK_MATTER_QUESTS.filter((q) => objectiveDoable(q.id, haves)).reduce((sum, q) => sum + q.darkMatter, 0);
        if (darkMatter >= DARK_MATTER_QUEST_TARGET) reachable.push(flags.objectives.darkMatterWin);
    }
    return reachable;
}

// The Crystal win needs a way to Zeromus: the Pass door in Toroia, or the moon via the Darkness Crystal.
const ZEROMUS_ROUTES = [KeyItem.PASS, KeyItem.DARKNESS_CRYSTAL];

function needsCrystalRoute(flags) {
    const groups = flags.objectives.groups;
    if (groups.length === 0 && !flags.objectives.darkMatterQuests) return true;
    return !groups.some((g) => g.rewards.some((r) => r.reward === 'game')) && flags.objectives.darkMatterWin !== 'game';
}

export function goModeStatus(state, flags) {
    const haves = makeHas(state, flags);
    const keyItemTotal = keyItemCount(state, flags);
    const hasRoute = ZEROMUS_ROUTES.some((keyItem) => haves.has(keyItem));
    const noObjectives = flags.objectives.groups.length === 0 && !flags.objectives.darkMatterQuests;

    // With no objectives the Crystal is a key item to find.
    const reachable = noObjectives ? (haves.has(KeyItem.CRYSTAL) ? ['crystal'] : []) : reachableRewards(state, flags, haves, keyItemTotal);
    const inGoMode = reachable.includes('game') || (reachable.includes('crystal') && hasRoute);

    // Outlines: green for key items the objectives use that you have; red for ones still worth
    // finding, which is none once you're in Go Mode.
    const used = new Set();
    let underworldOnly = new Set();
    for (const id of activeObjectiveIds(state, flags)) {
        const keyItems = OBJECTIVES[id].requires;
        const underworld = wantsUnderworld(keyItems);
        for (const keyItem of keyItems) {
            if (underworld && (keyItem === KeyItem.HOOK || keyItem === KeyItem.MAGMA_KEY)) underworldOnly.add(keyItem);
            else used.add(keyItem);
        }
    }
    underworldOnly = new Set([...underworldOnly].filter((k) => !used.has(k)));
    if (noObjectives) used.add(KeyItem.CRYSTAL);

    const itemStatus = state.keyItems.map((_, keyItem) => {
        const owned = haves.has(keyItem);
        if (needsCrystalRoute(flags) && ZEROMUS_ROUTES.includes(keyItem)) {
            if (owned) return KeyItemGoStatus.MET;
            if (!hasRoute && !inGoMode) return KeyItemGoStatus.MISSING;
        }
        if (used.has(keyItem)) {
            if (owned) return KeyItemGoStatus.MET;
            return inGoMode ? KeyItemGoStatus.NONE : KeyItemGoStatus.MISSING;
        }
        if (underworldOnly.has(keyItem)) {
            if (owned) return KeyItemGoStatus.MET;
            return inGoMode || haves.hasUnderworld ? KeyItemGoStatus.NONE : KeyItemGoStatus.MISSING;
        }
        return KeyItemGoStatus.NONE;
    });

    return { itemStatus, inGoMode };
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
