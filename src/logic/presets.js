import PRESETS from '../data/presets.json';

// Flag strings match regardless of case and spacing.
export function sameFlags(a, b) {
    const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');
    return normalize(a) === normalize(b);
}

// The preset whose flags are exactly `flagset`, looking in `preferredBranch` first since the
// same flags can appear on more than one site. Returns { name, branch } or null.
export function findPreset(flagset, preferredBranch) {
    const branches = [...PRESETS.branches].sort((a, b) => (b.id === preferredBranch) - (a.id === preferredBranch));
    for (const branch of branches) {
        for (const section of branch.sections) {
            for (const category of section.categories) {
                const preset = category.presets.find((p) => sameFlags(flagset, p.flags));
                if (preset) return { name: preset.name, branch: branch.name };
            }
        }
    }
    return null;
}
