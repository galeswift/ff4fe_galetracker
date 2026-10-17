import { CollectKind, DARK_MATTER_QUESTS, DARK_MATTER_QUEST_TARGET } from '../data/objectives';
import { ObjectiveItemKind } from './flags';
import { keyItemCount } from './goMode';

// Works out every objective group's progress. Objectives and random slots are checked off by hand;
// collect objectives and "complete group X" requirements complete themselves.

export const fixedSlotKey = (groupId, index) => `${groupId}:f${index}`;
export const randomSlotKey = (groupId, slot) => `${groupId}:r${slot}`;
export const DARK_MATTER_GROUP = 'DM';

export function collectValue(state, flags, counter) {
    if (counter === CollectKind.KEY_ITEMS) return keyItemCount(state, flags);
    if (counter === CollectKind.DARK_MATTER) return state.objectives.darkMatter;
    return state.objectives.counters[counter] ?? 0;
}

function isGroupRequirementMet(item, results) {
    const other = results[item.group];
    if (!other) return false;
    return item.count === 'all' ? other.completed === other.total : other.completed >= item.count;
}

export function objectiveGroupProgress(state, flags) {
    const { completed } = state.objectives;
    const results = {};

    for (const group of flags.objectives.groups) {
        const items = group.items.map((item, index) => {
            const slotKey = fixedSlotKey(group.id, index);
            if (item.kind === ObjectiveItemKind.COLLECT) {
                const value = collectValue(state, flags, item.counter);
                return { ...item, slotKey, value, done: value >= item.target };
            }
            if (item.kind === ObjectiveItemKind.GROUP) {
                return { ...item, slotKey, done: isGroupRequirementMet(item, results) };
            }
            return { ...item, slotKey, done: Boolean(completed[slotKey]), time: completed[slotKey]?.time ?? null };
        });

        const random = state.objectives.random[group.id] ?? [];
        for (let slot = 0; slot < group.randomCount; slot++) {
            const slotKey = randomSlotKey(group.id, slot);
            items.push({
                kind: 'random', slot, slotKey, id: random[slot] ?? null,
                done: Boolean(completed[slotKey]), time: completed[slotKey]?.time ?? null,
            });
        }

        const done = items.filter((i) => i.done).length;
        const rewards = group.rewards.map((r) => ({ ...r, earned: done >= (r.at === 'all' ? items.length : r.at) }));
        results[group.id] = { id: group.id, categories: group.categories, items, completed: done, total: items.length, rewards };
    }

    return flags.objectives.groups.map((g) => results[g.id]);
}

// Omode_dkmatter:quests — each quest is worth DkMatter; turning in 40 earns the reward.
export function darkMatterQuestProgress(state, flags) {
    if (!flags.objectives.darkMatterQuests) return null;
    const { completed, darkMatter } = state.objectives;
    const items = DARK_MATTER_QUESTS.map(({ id, darkMatter: value }) => {
        const slotKey = fixedSlotKey(DARK_MATTER_GROUP, id);
        return { kind: ObjectiveItemKind.OBJECTIVE, id, darkMatter: value, slotKey, done: Boolean(completed[slotKey]), time: completed[slotKey]?.time ?? null };
    });
    const reward = flags.objectives.darkMatterWin;
    return {
        items,
        target: DARK_MATTER_QUEST_TARGET,
        rewards: reward ? [{ at: DARK_MATTER_QUEST_TARGET, reward, earned: darkMatter >= DARK_MATTER_QUEST_TARGET }] : [],
    };
}

// Objective ids in play (fixed and chosen random ones), used for Go Mode.
export function activeObjectiveIds(state, flags) {
    const ids = new Set();
    for (const group of flags.objectives.groups) {
        group.items.filter((i) => i.kind === ObjectiveItemKind.OBJECTIVE).forEach((i) => ids.add(i.id));
        (state.objectives.random[group.id] ?? []).filter((id) => id !== null).forEach((id) => ids.add(id));
    }
    if (flags.objectives.darkMatterQuests) DARK_MATTER_QUESTS.forEach(({ id }) => ids.add(id));
    return [...ids].sort((a, b) => a - b);
}
