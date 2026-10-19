// Builds src/data/validFlags.json: every flag each Free Enterprise site accepts, read from the
// `order` list in that site's flags.js (the list its own validator checks against). Objective
// flags are stored without their group letter and slot number (see normalizeFlag) to keep the
// file small. The scripts are only read as text, never run.
//
// Usage: node scripts/generate-valid-flags.mjs
import { writeFileSync } from 'node:fs';
import { normalizeFlag } from '../src/logic/flagCheck.js';

const BRANCHES = [
    { id: 'main', site: 'ff4fe.com' },
    { id: 'fork', site: 'ff4fe.galeswift.com' },
    { id: 'alpha', site: 'alpha.ff4fe.com' },
];

// The "order" array inside flags.js's embedded flag spec.
function readOrder(source) {
    const key = source.indexOf('"order"');
    const start = source.indexOf('[', key);
    let depth = 0;
    let end = start;
    for (; end < source.length; end++) {
        if (source[end] === '[') depth++;
        else if (source[end] === ']' && --depth === 0) break;
    }
    return JSON.parse(source.slice(start, end + 1));
}

const result = { fetched: new Date().toISOString().slice(0, 10) };
for (const { id, site } of BRANCHES) {
    const response = await fetch(`https://${site}/script/flags.js`);
    if (!response.ok) throw new Error(`${site}: HTTP ${response.status}`);
    const order = readOrder(await response.text());
    const flags = [...new Set(order.map(normalizeFlag))].sort();
    console.log(`${site}: ${order.length} flags (${flags.length} stored)`);
    result[id] = flags;
}

const out = new URL('../src/data/validFlags.json', import.meta.url);
writeFileSync(out, JSON.stringify(result) + '\n');
console.log(`Wrote ${out.pathname}`);
