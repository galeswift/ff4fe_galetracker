// Snapshots each Free Enterprise site's flag presets into src/data/presets.json. The sites don't
// allow cross-origin requests, so the tracker ships a copy; rerun this to pick up new presets.
//
// Usage: node scripts/fetch-presets.mjs
import { writeFileSync } from 'node:fs';

const BRANCHES = [
    { id: 'main', name: "FE 4.6", site: "ff4fe.com" },
    { id: 'fork', name: "Galeswift 4.7", site: "ff4fe.galeswift.com" },
    { id: 'alpha', name: "FE 5.0 Alpha", site: "alpha.ff4fe.com" },
];

// Descriptions are HTML; the tracker shows them as plain tooltip text.
function plainText(html) {
    return (html ?? '')
        .replace(/<\/p>\s*<p>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .trim();
}

// The sites' list mixes { header } dividers and { category, presets } entries.
function toSections(entries) {
    const sections = [{ header: null, categories: [] }];
    for (const entry of entries) {
        if (entry.header) {
            sections.push({ header: entry.header, categories: [] });
        } else if (entry.presets) {
            sections[sections.length - 1].categories.push({
                name: entry.category,
                presets: entry.presets.map((p) => ({ name: p.name, description: plainText(p.description), flags: p.flags })),
            });
        }
    }
    return sections.filter((s) => s.categories.length > 0);
}

const branches = [];
for (const branch of BRANCHES) {
    const response = await fetch(`https://${branch.site}/presets`);
    if (!response.ok) throw new Error(`${branch.site}: HTTP ${response.status}`);
    const sections = toSections(await response.json());
    const count = sections.reduce((n, s) => n + s.categories.reduce((m, c) => m + c.presets.length, 0), 0);
    console.log(`${branch.site}: ${count} presets`);
    branches.push({ ...branch, sections });
}

const out = new URL('../src/data/presets.json', import.meta.url);
writeFileSync(out, JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), branches }, null, 1) + '\n');
console.log(`Wrote ${out.pathname}`);
