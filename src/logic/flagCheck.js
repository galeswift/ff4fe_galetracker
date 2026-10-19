// Checks a flagset against the flags each Free Enterprise site accepts (src/data/validFlags.json,
// built by scripts/generate-valid-flags.mjs), so typos like "Kmoom" can be pointed out before
// starting a tracker. It only knows whether each flag exists, not whether the combination is valid.

export const BRANCH_NAMES = { main: "FE 4.6", fork: "Galeswift 4.7", alpha: "FE 5.0 Alpha" };

// Objective flags repeat for every group and slot (OA1:quest_forge, OB3:quest_forge, ...), so
// they're compared without them: "O@" stands for a 5.0 group letter and "#" for a slot number.
export function normalizeFlag(flag) {
    return flag
        .replace(/^O[A-E](?=\d|random|do_|group_)/i, 'O@')
        .replace(/^O(@?)\d+:/i, 'O$1#:')
        .toLowerCase();
}

// Splits the text into single flags as FE writes them: "Kmain/miab:above,lst" becomes
// Kmain, Kmiab:above and Kmiab:lst; "OA1:quest_forge/random:4,boss" becomes OA1:quest_forge,
// OArandom:4 and OArandom:boss.
export function expandFlags(flagset) {
    const flags = [];
    for (const token of (flagset || '').trim().split(/\s+/).filter(Boolean)) {
        const prefix = token.startsWith('-') ? '' : (/^O[A-E](?=\d|random|do_|group_)/i.test(token) ? token.slice(0, 2) : token[0]);
        const entries = token.startsWith('-') ? [token] : token.slice(prefix.length).split('/');
        for (const entry of entries) {
            const colon = entry.indexOf(':');
            if (colon < 0) {
                flags.push(prefix + entry);
            } else {
                const key = entry.slice(0, colon + 1);
                entry.slice(colon + 1).split(',').forEach((value) => flags.push(prefix + key + value));
            }
        }
    }
    return flags;
}

// The flags in `flagset` that `branch` doesn't know, in the order typed.
export function unknownFlags(flagset, branch, validFlags) {
    const known = new Set(validFlags[branch]);
    return [...new Set(expandFlags(flagset).filter((flag) => !known.has(normalizeFlag(flag))))];
}

// Checks against every branch and reports against the one the flags fit best (fewest unknown
// flags); ties go to 5.0 when the flags look like 5.0, otherwise the Galeswift fork.
export function checkFlags(flagset, validFlags, looksLike50 = false) {
    if (!flagset || !flagset.trim()) return null;
    const order = looksLike50 ? ['alpha', 'fork', 'main'] : ['fork', 'main', 'alpha'];
    const results = order.map((branch) => ({ branch, unknown: unknownFlags(flagset, branch, validFlags) }));
    const best = results.reduce((a, b) => (b.unknown.length < a.unknown.length ? b : a));
    return { branch: best.branch, branchName: BRANCH_NAMES[best.branch], unknown: best.unknown };
}
