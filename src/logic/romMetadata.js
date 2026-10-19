import { OBJECTIVES, objectiveByKey } from '../data/objectives';
import { randomSlotCount } from './flags';

// Free Enterprise embeds a small JSON document in every seed ROM (generator.py: 4-byte
// little-endian length at unheadered 0x1FF000, then the JSON). It holds the version, the
// flags (unless hidden), the seed and the objective list, random picks included. Reading it is
// race-legal ("the embedded metadata doc ... file offset 0x1FF000+").

const LENGTH_OFFSET = 0x1FF000;
const MAX_LENGTH = 0x10000;

export class RomMetadataError extends Error {}

// `bytes` is the whole ROM file. Copier headers (512 bytes) are skipped.
export function readRomMetadata(bytes) {
    const header = bytes.length % 1024 === 512 ? 512 : 0;
    const start = header + LENGTH_OFFSET;
    if (bytes.length < start + 4) throw new RomMetadataError("This file is too small to be a Free Enterprise ROM.");

    const length = bytes[start] | (bytes[start + 1] << 8) | (bytes[start + 2] << 16) | (bytes[start + 3] << 24);
    if (length <= 0 || length > MAX_LENGTH || bytes.length < start + 4 + length) {
        throw new RomMetadataError("No Free Enterprise seed information found in this file.");
    }

    let doc;
    try {
        doc = JSON.parse(new TextDecoder('utf-8').decode(bytes.subarray(start + 4, start + 4 + length)));
    } catch {
        throw new RomMetadataError("The seed information in this ROM couldn't be read.");
    }
    return {
        version: doc.version ?? null,
        flags: doc.flags && doc.flags !== '(hidden)' ? doc.flags : null,
        flagsHidden: doc.flags === '(hidden)',
        seed: doc.seed ?? null,
        objectives: Array.isArray(doc.objectives) ? doc.objectives : [],
    };
}

// Objective text matches the tracker's names apart from small wording differences
// (the game says "Break Dark Elf's spell", the tracker "Break the Dark Elf's spell").
const normalize = (text) => text.toLowerCase().replace(/\bthe\b/g, '').replace(/[^a-z0-9]/g, '');
const BY_TEXT = new Map(OBJECTIVES.map((o) => [normalize(o.name), o.id]));

function objectiveFromTask(task) {
    if (typeof task !== 'string') return null; // counted objectives and group links aren't random picks
    return objectiveByKey(task)?.id ?? BY_TEXT.get(normalize(task)) ?? null;
}

// The random objectives the ROM picked, as { [groupId]: [objectiveId | null, ...] } in slot order.
// 5.0 lists each group's tasks (fixed ones first, then random); 4.x and the Gale fork list every
// objective's text in one flat list (fixed ones first, then random).
export function randomObjectivesFromRom(meta, flags) {
    const result = {};
    const grouped = meta.objectives.length > 0 && typeof meta.objectives[0] === 'object' && meta.objectives[0] !== null;

    for (const group of flags.objectives.groups) {
        const tasks = grouped
            ? meta.objectives.find((g) => g.key === `objectives_${group.id.toLowerCase()}`)?.tasks ?? []
            : meta.objectives;
        const picks = tasks.slice(group.items.length, group.items.length + randomSlotCount(group));
        result[group.id] = Array.from({ length: randomSlotCount(group) }, (_, slot) => objectiveFromTask(picks[slot]));
        // 4.x and the fork only ever have one group.
        if (!grouped) break;
    }
    return result;
}
