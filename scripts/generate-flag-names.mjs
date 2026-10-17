// Builds src/data/flagNames.json from Free Enterprise's flag UI spec, so the flags dialog and
// objective rewards can show readable names.
//
// Usage: download https://alpha.ff4fe.com/script/uispec.js, then
//   node scripts/generate-flag-names.mjs path/to/uispec.js
import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync(process.argv[2], 'utf8');
// The file is `var FLAG_UISPEC = [...];` — parse the array as JSON rather than running it.
const spec = JSON.parse(source.slice(source.indexOf('['), source.lastIndexOf(']') + 1));

const flags = {};
const rewards = {};

function walk(node) {
    const flag = node.flag;
    if (flag && !flag.startsWith('@') && node.title) {
        const reward = flag.match(/^OAdo_all:(.+)$/);
        if (reward) {
            rewards[reward[1]] = node.title;
        } else if (!/^O[A-E]/.test(flag)) {
            flags[flag] = node.title;
        }
    }
    for (const child of [...(node.controls ?? []), ...(node.subcontrols ?? [])]) {
        walk(child);
    }
}
spec.forEach(walk);

const sorted = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
const out = new URL('../src/data/flagNames.json', import.meta.url);
writeFileSync(out, JSON.stringify({ flags: sorted(flags), rewards: sorted(rewards) }, null, 1) + '\n');
console.log(`Wrote ${Object.keys(flags).length} flags and ${Object.keys(rewards).length} rewards to ${out.pathname}`);
