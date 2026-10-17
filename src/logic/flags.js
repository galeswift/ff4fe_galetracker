import { CHARACTERS } from '../data/characters';
import { KEY_ITEM_START_NAMES } from '../data/keyItems';
import { MiabZone } from '../data/locations';
import {
    CollectKind, DARK_MATTER_QUEST_TARGET, FIEND_OBJECTIVES, MAX_RANDOM_OBJECTIVES, OBJECTIVES, ObjectiveCategory, ObjectiveId,
    collectObjectiveName, objectiveByKey, parseCollectObjective,
} from '../data/objectives';
import FLAG_NAMES from '../data/flagNames.json';

// Ported from fftracker's SetModes() and extended for Free Enterprise 5.0. Both 4.x flagsets
// (O1:quest_forge/req:6/win:crystal) and 5.0 flagsets (OA1:quest_forge/do_6:crystal) are read.
// Only the flags the tracker acts on are parsed; readableSections() describes the rest.

export const ObjectiveItemKind = Object.freeze({
    OBJECTIVE: 'objective',
    COLLECT: 'collect',
    // "Complete N objectives from group X" (5.0 group_x:N).
    GROUP: 'group',
});

const ALL_CATEGORIES = { [ObjectiveCategory.QUEST]: true, [ObjectiveCategory.BOSS]: true, [ObjectiveCategory.CHARACTER]: true };
const NO_CATEGORIES = { [ObjectiveCategory.QUEST]: false, [ObjectiveCategory.BOSS]: false, [ObjectiveCategory.CHARACTER]: false };

// Key item, character and other flags that only exist in 5.0.
const K_50 = /^(CHAR|FORGE|LATEDARK|RISKY|UNWEIGHTED|START:|FORCE:|MIAB:)/;
const C_50 = /^(NOGIANT|WISHES|RISKY|PARTNER:|RESTRICT:)/;

export function defaultFlags() {
    return {
        version50: false,
        objectives: {
            // Each group: { id, items, randomCount, categories, rewards: [{ at: N | 'all', reward }] }
            groups: [],
            darkMatterCounter: false,
            // Omode_dkmatter:quests turns in 40 DkMatter for `darkMatterWin`.
            darkMatterQuests: false,
            darkMatterWin: null,
        },
        keyItems: { summon: false, moon: false, noFree: false, forge: false, miab: null, start: [] },
        characters: {
            allowed: Object.fromEntries(CHARACTERS.map((c) => [c.id, true])),
            hero: false,
            partySize: 5,
            noFree: false,
            noEarned: false,
            noGiant: false,
            wishes: false,
        },
        excludedBosses: [],
        warpGlitch: false,
        pushBToJump: false,
        noKeyBonus: false,
    };
}

export function splitFlagset(flagset) {
    return (flagset || '').trim().toUpperCase().split(/\s+/).filter((s) => s !== '');
}

function newGroup(id) {
    return { id, items: [], randomCount: 0, categories: { ...NO_CATEGORIES }, rewards: [] };
}

// Turns an objective key like "QUEST_FORGE" or "COLLECT_KI10" into a group item.
function objectiveItem(key) {
    const lower = key.toLowerCase();
    const collect = parseCollectObjective(lower);
    if (collect) return { kind: ObjectiveItemKind.COLLECT, counter: collect.kind, target: collect.target };
    const objective = objectiveByKey(lower);
    return objective ? { kind: ObjectiveItemKind.OBJECTIVE, id: objective.id } : null;
}

// fftracker let 4.x tough_quest allow every category; 5.0 limits it to quests.
function parseRandom(entry, group, toughQuestAllowsAll) {
    for (const part of entry.split(',')) {
        if (part === 'QUEST' || part === 'GATED_QUEST') group.categories[ObjectiveCategory.QUEST] = true;
        else if (part === 'BOSS') group.categories[ObjectiveCategory.BOSS] = true;
        else if (part === 'CHAR') group.categories[ObjectiveCategory.CHARACTER] = true;
        else if (part === 'TOUGH_QUEST') {
            group.categories[ObjectiveCategory.QUEST] = true;
            if (toughQuestAllowsAll) Object.assign(group.categories, ALL_CATEGORIES);
        } else if (part.startsWith('RANDOM:')) {
            group.randomCount = Math.min(parseInt(part.substring(7), 10) || 0, MAX_RANDOM_OBJECTIVES);
        }
    }
}

const addItem = (group, item) => {
    const duplicate = item.kind === ObjectiveItemKind.OBJECTIVE && group.items.some((i) => i.kind === item.kind && i.id === item.id);
    if (!duplicate) group.items.push(item);
};

// 5.0 group token, e.g. "OA1:QUEST_FORGE/2:COLLECT_KI10/RANDOM:3,BOSS/GROUP_B:ALL/DO_6:CRYSTAL".
function parseObjectiveGroup(token, flags) {
    const group = newGroup(token[1]);
    for (const entry of token.substring(2).split('/')) {
        if (entry.startsWith('RANDOM')) {
            parseRandom(entry, group, false);
        } else if (entry.startsWith('DO_')) {
            const [threshold, reward] = entry.substring(3).split(':');
            group.rewards.push({ at: threshold === 'ALL' ? 'all' : Number(threshold), reward: (reward ?? '').toLowerCase() });
        } else if (entry.startsWith('GROUP_')) {
            const [other, count] = entry.substring(6).split(':');
            group.items.push({ kind: ObjectiveItemKind.GROUP, group: other.toUpperCase(), count: count === 'ALL' ? 'all' : Number(count) });
        } else {
            const item = objectiveItem(entry.substring(entry.indexOf(':') + 1));
            if (item) addItem(group, item);
        }
    }
    if (!Object.values(group.categories).some((v) => v)) group.categories = { ...ALL_CATEGORIES };
    flags.objectives.groups.push(group);
}

// 4.x objectives all go into one group: "O1:QUEST_FORGE/RANDOM:6,TOUGH_QUEST/REQ:6/WIN:CRYSTAL".
function parseLegacyObjectives(keys, flags, legacy) {
    const group = legacy.group;
    for (const key of keys) {
        if (key.startsWith('MODE')) {
            for (const mode of key.substring(5).split(',')) {
                if (mode === 'CLASSICFORGE') addItem(group, { kind: ObjectiveItemKind.OBJECTIVE, id: ObjectiveId.CLASSIC_FORGE });
                if (mode === 'CLASSICGIANT') addItem(group, { kind: ObjectiveItemKind.OBJECTIVE, id: ObjectiveId.CLASSIC_GIANT });
                if (mode === 'FIENDS') FIEND_OBJECTIVES.forEach((id) => addItem(group, { kind: ObjectiveItemKind.OBJECTIVE, id }));
                if (mode === 'DKMATTER') {
                    addItem(group, { kind: ObjectiveItemKind.OBJECTIVE, id: ObjectiveId.DARK_MATTER });
                    flags.objectives.darkMatterCounter = true;
                }
            }
        } else if (key.startsWith('RANDOM')) {
            parseRandom(key, group, true);
        } else if (key.startsWith('WIN')) {
            legacy.win = key.substring(4) === 'GAME' ? 'game' : 'crystal';
        } else if (key.startsWith('REQ')) {
            legacy.required = key.substring(4);
        } else if (key !== 'NONE') {
            // Fixed objectives look like "1:QUEST_FORGE" or "12:BOSS_MILON".
            const item = objectiveItem(key.substring(key.indexOf(':') + 1));
            if (item) addItem(group, item);
        }
    }
}

export function parseFlags(flagset) {
    const flags = defaultFlags();
    const legacy = { group: newGroup('A'), win: null, required: '', used: false };

    for (const token of splitFlagset(flagset)) {
        const keys = token.substring(1).split('/');

        if (/^O[A-E]/.test(token)) {
            flags.version50 = true;
            parseObjectiveGroup(token, flags);
        } else if (token.startsWith('OMODE_DKMATTER')) {
            flags.version50 = true;
            flags.objectives.darkMatterQuests = true;
            flags.objectives.darkMatterCounter = true;
            const win = keys.find((k) => k.startsWith('WIN:'));
            flags.objectives.darkMatterWin = win ? win.substring(4).toLowerCase() : null;
        } else if (token.startsWith('O')) {
            legacy.used = true;
            parseLegacyObjectives(keys, flags, legacy);
        }

        if (token.startsWith('K')) {
            for (const key of keys) {
                if (K_50.test(key)) flags.version50 = true;
                if (key === 'SUMMON') flags.keyItems.summon = true;
                if (key === 'MOON') flags.keyItems.moon = true;
                if (key === 'NOFREE') flags.keyItems.noFree = true;
                if (key === 'FORGE') flags.keyItems.forge = true;
                if (key === 'TRAP' || key === 'MIAB') flags.keyItems.miab = 'standard';
                if (key.startsWith('MIAB:')) {
                    const zones = new Set(flags.keyItems.miab instanceof Set ? flags.keyItems.miab : []);
                    for (const zone of key.substring(5).split(',')) {
                        if (zone === 'ALL') [MiabZone.ABOVE, MiabZone.BELOW, MiabZone.LST].forEach((z) => zones.add(z));
                        else zones.add(zone.toLowerCase());
                    }
                    flags.keyItems.miab = zones;
                }
                if (key.startsWith('START:')) {
                    for (const name of key.substring(6).split(',')) {
                        if (name in KEY_ITEM_START_NAMES) flags.keyItems.start.push(KEY_ITEM_START_NAMES[name]);
                    }
                }
            }
        }

        if (token.startsWith('N')) {
            for (const key of keys) {
                if (key === 'CHARS') flags.characters.noFree = true;
                if (key === 'KEY') flags.keyItems.noFree = true;
            }
        }

        if (token.startsWith('C')) {
            if (keys.some((k) => C_50.test(k))) flags.version50 = true;
            parseCharacterFlags(keys, flags.characters);
        }

        if (token.startsWith('B')) {
            for (const key of keys) {
                if (key.startsWith('NO:')) flags.excludedBosses.push(...key.substring(3).toLowerCase().split(','));
            }
        }

        if (token.startsWith('X')) {
            flags.version50 = true;
            if (keys.includes('NOKEYBONUS')) flags.noKeyBonus = true;
        }

        if (token.startsWith('G')) {
            if (keys.includes('WARP')) flags.warpGlitch = true;
        }

        if (token === '-PUSHBTOJUMP') flags.pushBToJump = true;
        if (token.startsWith('-EXP:') && token.substring(5).split(/[,/]/).includes('NOKEYBONUS')) flags.noKeyBonus = true;
    }

    if (legacy.used) {
        const { group } = legacy;
        // With no random categories listed, every category is allowed.
        if (!Object.values(group.categories).some((v) => v)) group.categories = { ...ALL_CATEGORIES };
        const win = legacy.win ?? 'crystal';
        group.rewards.push({ at: legacy.required === '' || legacy.required === 'ALL' ? 'all' : Number(legacy.required), reward: win });
        group.items.sort((a, b) => a.id - b.id);
        if (group.items.length > 0 || group.randomCount > 0) flags.objectives.groups.unshift(group);
    }

    if (flags.objectives.groups.some((g) => g.items.some((i) => i.kind === ObjectiveItemKind.COLLECT && i.counter === CollectKind.DARK_MATTER))
        || flags.objectives.groups.some((g) => g.rewards.some((r) => r.reward.startsWith('dkmatter')))) {
        flags.objectives.darkMatterCounter = true;
    }
    return flags;
}

function parseCharacterFlags(keys, characters) {
    // Characters that may start the game. A character excluded with no: is still available if they can start.
    let startPool = new Set();
    const setAllowed = (name, value) => {
        const character = CHARACTERS.find((c) => c.flag === name);
        if (character) characters.allowed[character.id] = value;
    };

    for (const key of keys) {
        if (key === 'HERO') characters.hero = true;
        else if (key === 'NOFREE') characters.noFree = true;
        else if (key === 'NOGIANT') characters.noGiant = true;
        else if (key === 'WISHES') characters.wishes = true;
        else if (key.startsWith('NOEARNED')) characters.noEarned = true;
        else if (key.startsWith('START:')) {
            const names = key.substring(6).split(',');
            const excluded = names.filter((n) => n.startsWith('NOT_')).map((n) => n.substring(4));
            if (names.includes('ANY') || excluded.length > 0) {
                startPool = new Set(CHARACTERS.map((c) => c.flag).filter((n) => !excluded.includes(n)));
            } else {
                startPool = new Set(names);
            }
        } else if (key.startsWith('PARTY:')) {
            const size = parseInt(key.substring(6), 10) || 5;
            characters.partySize = Math.min(5, Math.max(1, size));
        } else if (key.startsWith('NO:')) {
            for (const name of key.substring(3).split(',')) {
                setAllowed(name, startPool.has(name));
            }
        } else if (key.startsWith('ONLY:')) {
            for (const character of CHARACTERS) {
                characters.allowed[character.id] = startPool.has(character.flag);
            }
            for (const name of key.substring(5).split(',')) {
                setAllowed(name, true);
            }
        }
    }
}

// ---- Readable descriptions for the flags dialog ----

const SECTION_TITLES = {
    O: "Objectives",
    K: "Key Items",
    P: "Pass",
    N: "Challenges",
    C: "Characters",
    T: "Treasure Chests",
    S: "Shops",
    B: "Bosses",
    E: "Encounters",
    X: "Experience",
    G: "Glitches",
    Q: "Quality of Life",
    '-': "Other",
};

export function rewardName(reward) {
    return FLAG_NAMES.rewards[reward] ?? reward;
}

export function objectiveItemName(item) {
    if (item.kind === ObjectiveItemKind.COLLECT) return collectObjectiveName({ kind: item.counter, target: item.target });
    if (item.kind === ObjectiveItemKind.GROUP) {
        return item.count === 'all' ? `Complete all objectives in group ${item.group}` : `Complete ${item.count} objectives in group ${item.group}`;
    }
    return OBJECTIVES[item.id].name;
}

function categoryList(categories) {
    const names = { [ObjectiveCategory.QUEST]: "quests", [ObjectiveCategory.BOSS]: "bosses", [ObjectiveCategory.CHARACTER]: "characters" };
    return Object.entries(categories).filter(([, v]) => v).map(([k]) => names[k]).join(', ');
}

function describeGroup(group) {
    const entries = group.items.map(objectiveItemName);
    if (group.randomCount > 0) entries.push(`${group.randomCount} random (${categoryList(group.categories)})`);
    for (const { at, reward } of group.rewards) {
        entries.push(`${at === 'all' ? 'All' : at} → ${rewardName(reward)}`);
    }
    return entries;
}

// Looks up "Cno:tellah,fusoya" as "Cno:tellah" and "Cno:fusoya".
function describeEntry(letter, entry) {
    const lower = entry.toLowerCase();
    const exact = FLAG_NAMES.flags[letter + lower];
    if (exact) return exact;
    const colon = lower.indexOf(':');
    if (colon > 0) {
        const prefix = lower.substring(0, colon + 1);
        const parts = lower.substring(colon + 1).split(',').map((v) => FLAG_NAMES.flags[letter + prefix + v]);
        // Bno: titles are just boss names.
        if (parts.every(Boolean)) return letter === 'B' && prefix === 'no:' ? `Exclude ${parts.join(', ')}` : parts.join(', ');
    }
    return lower;
}

// Groups the flagset for display, e.g. { title: "Key Items", entries: ["Randomize key items", ...] }.
export function readableSections(flagset) {
    const sections = [];
    const add = (title, entries) => {
        const existing = sections.find((s) => s.title === title);
        if (existing) existing.entries.push(...entries);
        else sections.push({ title, entries: [...entries] });
    };

    const flags = parseFlags(flagset);
    if (flags.objectives.darkMatterQuests) {
        const win = flags.objectives.darkMatterWin;
        add("Objectives", [`Complete quests to win DkMatter${win ? ` (${DARK_MATTER_QUEST_TARGET} → ${rewardName(win)})` : ''}`]);
    }
    for (const group of flags.objectives.groups) {
        add(flags.objectives.groups.length > 1 || flags.version50 ? `Objectives — Group ${group.id}` : "Objectives", describeGroup(group));
    }

    for (const token of splitFlagset(flagset)) {
        const letter = token[0];
        if (letter === 'O') continue;
        const title = SECTION_TITLES[letter] ?? token;
        const entries = letter === '-' ? [describeEntry('', token)] : token.substring(1).split('/').map((e) => describeEntry(letter, e));
        add(title, entries);
    }
    return sections;
}
