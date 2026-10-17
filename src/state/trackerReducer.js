import { KEY_ITEMS, KeyItemState } from '../data/keyItems';
import { KeyItemCheck, TRAPPED_CHEST_LOCATIONS } from '../data/locations';
import { MAX_DARK_MATTER } from '../data/objectives';
import { elapsedMs, initialTimer, pauseTimer, startTimer } from '../logic/timer';

export const LocationView = Object.freeze({ UNCHECKED: 'unchecked', CHECKED: 'checked' });

export function initialTrackerState(flagset, flags) {
    return {
        flagset,
        // 5.0 Kstart: begins with that key item found.
        keyItems: KEY_ITEMS.map((k) => (flags.keyItems.start.includes(k.id) ? KeyItemState.FOUND : KeyItemState.NONE)),
        // { [checkId]: { time } } — time is the timer reading when checked, or null.
        keyItemChecks: {},
        characterChecks: {},
        trapCounts: {},
        warpGlitch: null,
        mist: false,
        party: [-1, -1, -1, -1, -1].slice(0, flags.characters.partySize),
        objectives: {
            // { [slotKey]: { time } } for objectives checked off by hand; see logic/objectives.js for slot keys.
            completed: {},
            // { [groupId]: [objectiveId | null, ...] } — what each random slot turned out to be.
            random: Object.fromEntries(flags.objectives.groups.map((g) => [g.id, Array(g.randomCount).fill(null)])),
            darkMatter: 0,
            // Shared counts for collect_boss / collect_chest / collect_gp (GP in thousands).
            counters: { boss: 0, chest: 0, gp: 0 },
        },
        bossesSeen: {},
        notes: '',
        timer: initialTimer(),
        views: { keyItems: LocationView.UNCHECKED, characters: LocationView.UNCHECKED, traps: LocationView.UNCHECKED },
    };
}

const toggleCheck = (checks, id, time) => {
    const next = { ...checks };
    if (next[id]) {
        delete next[id];
    } else {
        next[id] = { time };
    }
    return next;
};

// The timer reading to stamp on a check, or null when the timer isn't running.
const timestamp = (state) => (state.timer.running ? elapsedMs(state.timer) : null);

export function trackerReducer(state, action) {
    switch (action.type) {
        case 'reset':
            return initialTrackerState(action.flagset, action.flags);

        case 'cycleKeyItem': {
            const keyItems = [...state.keyItems];
            keyItems[action.keyItem] = (keyItems[action.keyItem] + 1) % 3;
            return { ...state, keyItems };
        }

        case 'toggleMist':
            return { ...state, mist: !state.mist };

        case 'toggleKeyItemCheck':
            return { ...state, keyItemChecks: toggleCheck(state.keyItemChecks, action.id, timestamp(state)) };

        case 'resolveWarpGlitch': {
            // "Yes" means the warp skipped Sealed Cave, so it gets checked off too.
            const keyItemChecks = action.used && !state.keyItemChecks[KeyItemCheck.SEALED_CAVE]
                ? { ...state.keyItemChecks, [KeyItemCheck.SEALED_CAVE]: { time: timestamp(state) } }
                : state.keyItemChecks;
            return { ...state, keyItemChecks, warpGlitch: action.used ? 'yes' : 'no' };
        }

        case 'toggleCharacterCheck':
            return { ...state, characterChecks: toggleCheck(state.characterChecks, action.id, null) };

        case 'clickTrapChest': {
            // Each click opens one chest; clicking a finished location resets its count.
            const location = TRAPPED_CHEST_LOCATIONS.find((l) => l.id === action.id);
            const remaining = state.trapCounts[action.id] ?? location.count;
            const next = remaining === 0 ? location.count : remaining - 1;
            return { ...state, trapCounts: { ...state.trapCounts, [action.id]: next } };
        }

        case 'setView':
            return { ...state, views: { ...state.views, [action.column]: action.view } };

        case 'setPartyMember': {
            const party = [...state.party];
            party[action.slot] = action.character;
            return { ...state, party };
        }

        case 'toggleObjective':
            return {
                ...state,
                objectives: { ...state.objectives, completed: toggleCheck(state.objectives.completed, action.slotKey, timestamp(state)) },
            };

        case 'setRandomObjective': {
            // Picking a new objective for a slot clears that slot's completion.
            const slots = [...(state.objectives.random[action.group] ?? [])];
            slots[action.slot] = action.objectiveId;
            const completed = { ...state.objectives.completed };
            delete completed[action.slotKey];
            return { ...state, objectives: { ...state.objectives, random: { ...state.objectives.random, [action.group]: slots }, completed } };
        }

        case 'setDarkMatter': {
            const darkMatter = Math.min(MAX_DARK_MATTER, Math.max(0, action.value));
            return { ...state, objectives: { ...state.objectives, darkMatter } };
        }

        case 'setCounter': {
            const counters = { ...state.objectives.counters, [action.counter]: Math.max(0, action.value) };
            return { ...state, objectives: { ...state.objectives, counters } };
        }

        case 'toggleBoss':
            return { ...state, bossesSeen: { ...state.bossesSeen, [action.id]: !state.bossesSeen[action.id] } };

        case 'setNotes':
            return { ...state, notes: action.notes };

        case 'startTimer':
            return { ...state, timer: startTimer(state.timer) };

        case 'pauseTimer':
            return { ...state, timer: pauseTimer(state.timer) };

        case 'resetTimer':
            return { ...state, timer: initialTimer() };

        default:
            throw new Error(`Unknown tracker action: ${action.type}`);
    }
}
