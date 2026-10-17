// Builds src/data/flagNames.json from Free Enterprise's flag UI specs, so the flags dialog and
// objective rewards can show readable names. Names are kept per version, since the 5.0 alpha
// and the 4.7 Gale fork sometimes use the same flag for different things.
//
// Usage: download both specs, then
//   node scripts/generate-flag-names.mjs <alpha uispec.js> <fork uispec.js>
// alpha: https://alpha.ff4fe.com/script/uispec.js
// fork:  https://ff4fe.galeswift.com/script/uispec.js
import { readFileSync, writeFileSync } from 'node:fs';

// Each file is `var FLAG_UISPEC = [...];` — parse the array as JSON rather than running it.
function readSpec(path) {
    const source = readFileSync(path, 'utf8');
    return JSON.parse(source.slice(source.indexOf('['), source.lastIndexOf(']') + 1));
}

// Every flag's title, minus objectives (the tracker names those itself). Also collects
// 5.0's objective reward names from group A's "do_all" options.
function collectNames(spec, rewards) {
    const flags = {};
    const walk = (node) => {
        const flag = node.flag;
        if (flag && !flag.startsWith('@') && node.title) {
            const reward = flag.match(/^OAdo_all:(.+)$/);
            if (reward && rewards) rewards[reward[1]] = node.title;
            else if (!flag.startsWith('O')) flags[flag] = node.title;
        }
        [...(node.controls ?? []), ...(node.subcontrols ?? [])].forEach(walk);
    };
    spec.forEach(walk);
    return flags;
}

const sorted = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
const rewards = {};
const alpha = collectNames(readSpec(process.argv[2]), rewards);
const fork = collectNames(readSpec(process.argv[3]), null);

const out = new URL('../src/data/flagNames.json', import.meta.url);
writeFileSync(out, JSON.stringify({ alpha: sorted(alpha), fork: sorted(fork), rewards: sorted(rewards) }, null, 1) + '\n');
console.log(`Wrote ${Object.keys(alpha).length} alpha flags, ${Object.keys(fork).length} fork flags and ${Object.keys(rewards).length} rewards to ${out.pathname}`);
