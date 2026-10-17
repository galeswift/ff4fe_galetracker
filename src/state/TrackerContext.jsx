import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { parseFlags } from '../logic/flags';
import { initialTrackerState, trackerReducer } from './trackerReducer';
import { load, save, StorageKey } from './storage';

const TrackerContext = createContext(null);

// Bump when the saved state's shape changes; older saves are dropped.
const SAVE_VERSION = 2;

function loadSavedState() {
    const saved = load(StorageKey.TRACKER, null);
    return saved?.version === SAVE_VERSION ? saved.state : null;
}

export function TrackerProvider({ initialFlagset, settings, children }) {
    const [state, dispatch] = useReducer(trackerReducer, null, () => {
        const saved = loadSavedState();
        return saved ?? initialTrackerState(initialFlagset, parseFlags(initialFlagset));
    });

    const flags = useMemo(() => parseFlags(state.flagset), [state.flagset]);

    useEffect(() => {
        save(StorageKey.TRACKER, { version: SAVE_VERSION, state });
    }, [state]);

    const value = useMemo(() => ({ state, flags, settings, dispatch }), [state, flags, settings]);
    return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker() {
    return useContext(TrackerContext);
}

export function hasSavedTracker() {
    return loadSavedState() !== null;
}
