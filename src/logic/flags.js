import { CHARACTERS } from '../data/characters';
import { KEY_ITEM_START_NAMES } from '../data/keyItems';
import { MiabZone } from '../data/locations';
import {
    CollectKind, DARK_MATTER_QUEST_TARGET, FIEND_OBJECTIVES, MAX_RANDOM_OBJECTIVES, OBJECTIVES, ObjectiveCategory, ObjectiveId,
    collectObjectiveName, objectiveByKey, parseCollectObjective,
} from '../data/objectives';
import FLAG_NAMES from '../data/flagNames.json';

// Ported from fftracker's SetModes() and extended for Free Enterprise 5.0 and the 4.7 Gale fork.
// 4.x and fork flagsets (O1:quest_forge/req:6/win:crystal) and 5.0 flagsets
// (OA1:quest_forge/do_6:crystal) are all read. Only the flags the tracker acts on are parsed;
// readableSections() describes the rest.

export const ObjectiveItemKind = Object.freeze({
    OBJECTIVE: 'objective',
    COLLECT: 'collect',
    // "Complete N objectives from group X" (5.0 group_x:N).
    GROUP: 'group',
});

// Where Toroia's free key item goes with Knofree: Mist Village after D.Mist, or (fork)
// Cid in Dwarf Castle, or Rydia's mom once Mist is burned with the Package.
export const NoFreeKeyItem = Object.freeze({ MIST: 'mist', DWARF: 'dwarf', PACKAGE: 'package' });

const ALL_CATEGORIES = { [ObjectiveCategory.QUEST]: true, [ObjectiveCategory.BOSS]: true, [ObjectiveCategory.CHARACTER]: true };
const NO_CATEGORIES = { [ObjectiveCategory.QUEST]: false, [ObjectiveCategory.BOSS]: false, [ObjectiveCategory.CHARACTER]: false };

// Key item and character flags that only exist in 5.0 (the fork shares Kforge, Kstart, Kmiab:, X flags...).
const K_50 = /^(CHAR|RISKY)$/;
const C_50 = /^(NOGIANT|WISHES|RISKY|PARTNER:)/;

export function defaultFlags() {
    return {
        version50: false,
        objectives: {
            // Each group: { id, items, random: [{ count, categories, onlyCharacters }], rewards: [{ at: N | 'all', reward }] }
            groups: [],
            darkMatterCounter: false,
            // Omode_dkmatter:quests turns in 40 DkMatter for `darkMatterWin`.
            darkMatterQuests: false,
            darkMatterWin: null,
        },
        keyItems: { summon: false, moon: false, unsafe: false, noFree: null, forge: false, pink: false, miab: null, start: [] },
        characters: {
            allowed: Object.fromEntries(CHARACTERS.map((c) => [c.id, true])),
            hero: false,
            paladin: false,
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
        // Fork doors/entrances rando reshuffles the map, so location logic doesn't apply.
        mapShuffled: false,
        startUnderground: false,
    };
}

export function splitFlagset(flagset) {
    return (flagset || '').trim().toUpperCase().split(/\s+/).filter((s) => s !== '');
}

function newGroup(id) {
    return { id, items: [], random: [], rewards: [] };
}

export function randomSlotCount(group) {
    return group.random.reduce((sum, bucket) => sum + bucket.count, 0);
}

// Turns an objective key like "QUEST_FORGE" or "COLLECT_KI10" into a group item.
function objectiveItem(key) {
    const lower = key.toLowerCase();
    const collect = parseCollectObjective(lower);
    if (collect) return { kind: ObjectiveItemKind.COLLECT, counter: collect.kind, target: collect.target };
    const objective = objectiveByKey(lower);
    return objective ? { kind: ObjectiveItemKind.OBJECTIVE, id: objective.id } : null;
}

// One random bucket, e.g. "RANDOM:3,QUEST,CHAR,ONLYCECIL" or "RANDOM2:2,BOSS".
// fftracker let 4.x tough_quest allow every category; 5.0 limits it to quests.
function parseRandomBucket(entry, bucket, toughQuestAllowsAll) {
    const [first, ...rest] = entry.split(',');
    const value = first.substring(first.indexOf(':') + 1);
    const parts = /^\d+$/.test(value) ? rest : [value, ...rest];
    if (/^\d+$/.test(value)) bucket.count = Math.min(parseInt(value, 10), MAX_RANDOM_OBJECTIVES);

    for (const part of parts) {
        if (part === 'QUEST' || part === 'GATED_QUEST') bucket.categories[ObjectiveCategory.QUEST] = true;
        else if (part === 'BOSS') bucket.categories[ObjectiveCategory.BOSS] = true;
        else if (part === 'CHAR') bucket.categories[ObjectiveCategory.CHARACTER] = true;
        else if (part === 'TOUGH_QUEST') {
            bucket.categories[ObjectiveCategory.QUEST] = true;
            if (toughQuestAllowsAll) Object.assign(bucket.categories, ALL_CATEGORIES);
        } else if (part.startsWith('ONLY')) {
            // Fork: random character hunts only for these characters.
            const character = CHARACTERS.find((c) => c.flag === part.substring(4));
            if (character) bucket.onlyCharacters = [...(bucket.onlyCharacters ?? []), character.id];
        }
    }
}

function finishBuckets(group) {
    group.random = group.random.filter((b) => b.count > 0);
    for (const bucket of group.random) {
        if (!Object.values(bucket.categories).some((v) => v)) bucket.categories = { ...ALL_CATEGORIES };
    }
}

function bucketFor(group, index) {
    group.random[index] ??= { count: 0, categories: { ...NO_CATEGORIES }, onlyCharacters: null };
    return group.random[index];
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
            parseRandomBucket(entry, bucketFor(group, 0), false);
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
    finishBuckets(group);
    flags.objectives.groups.push(group);
}

// 4.x and fork objectives all go into one group, e.g.
// "OMODE:CLASSICFORGE,KI10/1:QUEST_FORGE/RANDOM:6,TOUGH_QUEST/RANDOM2:2,BOSS/REQ:6/HARDREQ:1/WIN:CRYSTAL".
function parseLegacyObjectives(keys, flags, legacy) {
    for (const key of keys) {
        if (key.startsWith('MODE:')) {
            legacy.modes.push(...key.substring(5).split(','));
        } else if (/^RANDOM[23]?:/.test(key)) {
            const index = key[6] === ':' ? 0 : Number(key[6]) - 1;
            parseRandomBucket(key, bucketFor(legacy.group, index), true);
        } else if (key.startsWith('WIN:')) {
            legacy.win = key.substring(4) === 'GAME' ? 'game' : 'crystal';
        } else if (key.startsWith('REQ:')) {
            legacy.required = key.substring(4);
        } else if (key.startsWith('HARDREQ:')) {
            key.substring(8).split(',').forEach((n) => legacy.hardRequired.add(Number(n)));
        } else if (key.startsWith('GATED:')) {
            legacy.gated = Number(key.substring(6));
        } else if (key !== 'NONE') {
            // Fixed objectives look like "1:QUEST_FORGE" or "12:BOSS_MILON".
            const item = objectiveItem(key.substring(key.indexOf(':') + 1));
            if (item) legacy.custom.push(item);
        }
    }
}

// Builds the 4.x/fork group in the fork's objective order (modes, then the counted modes, then
// O1-O8), which is what Ohardreq:N and Ogated:N count through.
function finishLegacyGroup(legacy, flags) {
    const { group, modes } = legacy;
    const objective = (id) => ({ kind: ObjectiveItemKind.OBJECTIVE, id });
    const counted = (mode, counter) => {
        const match = modes.map((m) => m.match(new RegExp(`^${mode}(\\d+)$`))).find(Boolean);
        if (match) addItem(group, { kind: ObjectiveItemKind.COLLECT, counter, target: Number(match[1]) });
    };

    if (modes.includes('CLASSICFORGE')) addItem(group, objective(ObjectiveId.CLASSIC_FORGE));
    if (modes.includes('CLASSICGIANT')) addItem(group, objective(ObjectiveId.CLASSIC_GIANT));
    if (modes.includes('FIENDS')) FIEND_OBJECTIVES.forEach((id) => addItem(group, objective(id)));
    if (modes.includes('EXTERNAL')) addItem(group, objective(ObjectiveId.EXTERNAL));
    if (modes.includes('DKMATTER')) {
        // 4.x: 30 of 45 DkMatter
        addItem(group, objective(ObjectiveId.DARK_MATTER));
        flags.objectives.darkMatterCounter = true;
    }
    counted('DKMATTER', CollectKind.DARK_MATTER);
    counted('KI', CollectKind.KEY_ITEMS);
    counted('BOSSCOLLECTOR', CollectKind.BOSSES);
    counted('GOLDHUNTER', CollectKind.GP);
    legacy.custom.forEach((item) => addItem(group, item));

    group.items = group.items.map((item, index) => ({
        ...item,
        ...(legacy.hardRequired.has(index + 1) ? { hardRequired: true } : {}),
        ...(legacy.gated === index + 1 ? { gated: true } : {}),
    }));
    finishBuckets(group);

    const win = legacy.win ?? 'crystal';
    group.rewards.push({ at: legacy.required === '' || legacy.required === 'ALL' ? 'all' : Number(legacy.required), reward: win });
    if (group.items.length > 0 || group.random.length > 0) flags.objectives.groups.unshift(group);
}

export function parseFlags(flagset) {
    const flags = defaultFlags();
    const legacy = { group: newGroup('A'), modes: [], custom: [], win: null, required: '', hardRequired: new Set(), gated: null, used: false };

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
                if (key === 'UNSAFE') flags.keyItems.unsafe = true;
                if (key === 'FORGE') flags.keyItems.forge = true;
                if (key === 'PINK') flags.keyItems.pink = true;
                if (key === 'NOFREE') flags.keyItems.noFree ??= NoFreeKeyItem.MIST;
                if (key === 'NOFREE:DWARF') flags.keyItems.noFree = NoFreeKeyItem.DWARF;
                if (key === 'NOFREE:PACKAGE') flags.keyItems.noFree = NoFreeKeyItem.PACKAGE;
                if (key === 'TRAP' || key === 'MIAB' || key === 'MIAB:STANDARD') flags.keyItems.miab = 'standard';
                if (key.startsWith('MIAB:') && key !== 'MIAB:STANDARD') {
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
                if (key === 'KEY') flags.keyItems.noFree ??= NoFreeKeyItem.MIST;
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
            if (keys.includes('NOKEYBONUS')) flags.noKeyBonus = true;
        }

        if (token.startsWith('G')) {
            if (keys.includes('WARP')) flags.warpGlitch = true;
        }

        if (token === '-PUSHBTOJUMP') flags.pushBToJump = true;
        if (token.startsWith('-EXP:') && token.substring(5).split(/[,/]/).includes('NOKEYBONUS')) flags.noKeyBonus = true;
        if (token.startsWith('-DOORSRANDO:') || token.startsWith('-ENTRANCESRANDO:')) flags.mapShuffled = true;
        if (token === '-STARTING:UNDERGROUND') flags.startUnderground = true;
    }

    if (legacy.used) finishLegacyGroup(legacy, flags);

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
        if (key === 'HERO' || key === 'SUPERHERO') characters.hero = true;
        else if (key === 'PALADIN') characters.paladin = true;
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
    H: "Harp",
    F: "FuSoYa",
    A: "Agility",
    Z: "Zeromus",
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

function categoryList(bucket) {
    const names = { [ObjectiveCategory.QUEST]: "quests", [ObjectiveCategory.BOSS]: "bosses", [ObjectiveCategory.CHARACTER]: "characters" };
    const list = Object.entries(bucket.categories).filter(([, v]) => v).map(([k]) => names[k]);
    if (bucket.onlyCharacters) list.push(`only ${bucket.onlyCharacters.map((id) => CHARACTERS[id].name).join(', ')}`);
    return list.join(', ');
}

function describeGroup(group) {
    const entries = group.items.map((item) => objectiveItemName(item)
        + (item.hardRequired ? ' (hard required)' : '') + (item.gated ? ' (gated)' : ''));
    for (const bucket of group.random) entries.push(`${bucket.count} random (${categoryList(bucket)})`);
    for (const { at, reward } of group.rewards) {
        entries.push(`${at === 'all' ? 'All' : at} → ${rewardName(reward)}`);
    }
    return entries;
}

// Looks up "Cno:tellah,fusoya" as "Cno:tellah" and "Cno:fusoya", in this version's names first.
function describeEntry(letter, entry, names) {
    const lower = entry.toLowerCase();
    const lookup = (flag) => names.find((n) => n[flag])?.[flag];
    const exact = lookup(letter + lower);
    if (exact) return exact;
    const colon = lower.indexOf(':');
    if (colon > 0) {
        const prefix = lower.substring(0, colon + 1);
        const parts = lower.substring(colon + 1).split(',').map((v) => lookup(letter + prefix + v));
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
    const names = flags.version50 ? [FLAG_NAMES.alpha, FLAG_NAMES.fork] : [FLAG_NAMES.fork, FLAG_NAMES.alpha];
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
        const entries = letter === '-' ? [describeEntry('', token, names)] : token.substring(1).split('/').map((e) => describeEntry(letter, e, names));
        add(title, entries);
    }
    return sections;
}
