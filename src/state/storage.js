// localStorage can throw (private windows, blocked storage), so every access is guarded and
// the tracker still works without it.
export function load(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Not being able to save shouldn't break tracking.
    }
}

export const StorageKey = Object.freeze({
    DARK_MODE: 'saved_darkMode',
    FLAGSET: 'saved_flagset',
    SETTINGS: 'saved_settings',
    TRACKER: 'saved_tracker',
    PRESET_BRANCH: 'saved_presetBranch',
});
