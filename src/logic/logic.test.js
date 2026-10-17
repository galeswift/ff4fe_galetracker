import { describe, expect, it } from 'vitest';
import { KeyItem } from '../data/keyItems';
import { CharacterCheck, KeyItemCheck, Trap } from '../data/locations';
import { OBJECTIVES, ObjectiveCategory, objectiveByKey } from '../data/objectives';
import { DEFAULT_SETTINGS } from '../state/settings';
import { initialTrackerState, trackerReducer } from '../state/trackerReducer';
import {
    characterLocationList, isCecilPaladin, isRydiaAdult, keyItemLocationList, showWarpGlitchPrompt, trapLocationList,
} from './availability';
import { parseFlags, readableSections } from './flags';
import { goModeStatus, KeyItemGoStatus, keyItemCount } from './goMode';
import { darkMatterQuestProgress, objectiveGroupProgress } from './objectives';

// 4.x ZZ6 tournament flags.
const ZZ6 = "O1:quest_forge/random:7,tough_quest/req:6/win:crystal Kmain/summon/moon/nofree Pkey Cstandard/nofree/start:cecil,kain,rydia,edward,rosa,yang,palom,porom,cid,edge/no:tellah,fusoya/j:abilities/nekkie/nodupes/hero Tpro/no:j/mintier:3/maxtier:7 Spro Bstandard/alt:gauntlet/whichburn Etoggle/no:jdrops Glife/backrow -kit:freedom -noadamants -nocursed -spoon";
const idOf = (key) => objectiveByKey(key).id;

function setup(flagset, settings = DEFAULT_SETTINGS) {
    const flags = parseFlags(flagset);
    return { flags, settings, state: initialTrackerState(flagset, flags) };
}

const apply = (state, ...actions) => actions.reduce(trackerReducer, state);
const withKeyItems = (state, ...keyItems) => apply(state, ...keyItems.map((keyItem) => ({ type: 'cycleKeyItem', keyItem })));
const visible = (list) => list.filter((l) => l.available && !l.checked).map((l) => l.id);

describe('parseFlags', () => {
    it('parses the ZZ6 preset', () => {
        const flags = parseFlags(ZZ6);
        expect(flags.version50).toBe(false);
        const [group] = flags.objectives.groups;
        expect(group.items).toEqual([{ kind: 'objective', id: idOf('quest_forge') }]);
        expect(group.random.map((b) => b.count)).toEqual([7]);
        expect(group.rewards).toEqual([{ at: 6, reward: 'crystal' }]);
        expect(flags.keyItems).toMatchObject({ summon: true, moon: true, miab: null, noFree: 'mist' });
        expect(flags.characters.hero).toBe(true);
        expect(flags.characters.noFree).toBe(true);
        expect(flags.characters.allowed[3]).toBe(false); // Tellah
        expect(flags.characters.allowed[11]).toBe(false); // FuSoYa
        expect(flags.characters.allowed[0]).toBe(true);
    });

    it('reads fixed objectives numbered 10 and up', () => {
        const flags = parseFlags('O1:quest_magnes/10:quest_zot/11:boss_milon');
        // Kept in flag order, which is how the fork numbers them for Ohardreq / Ogated.
        expect(flags.objectives.groups[0].items.map((i) => i.id)).toEqual([idOf('quest_magnes'), idOf('quest_zot'), idOf('boss_milon')]);
    });

    it('allows every random category unless some are listed', () => {
        expect(Object.values(parseFlags('Orandom:3').objectives.groups[0].random[0].categories)).toEqual([true, true, true]);
        expect(parseFlags('Orandom:3,boss').objectives.groups[0].random[0].categories).toEqual({
            [ObjectiveCategory.QUEST]: false, [ObjectiveCategory.BOSS]: true, [ObjectiveCategory.CHARACTER]: false,
        });
    });

    it('expands legacy objective modes', () => {
        const flags = parseFlags('Omode:classicforge,fiends,dkmatter/win:game');
        const ids = flags.objectives.groups[0].items.map((i) => i.id);
        expect(ids).toContain(0);
        expect(ids).toContain(idOf('boss_milon'));
        expect(ids).toContain(idOf('boss_elements'));
        expect(flags.objectives.darkMatterCounter).toBe(true);
        expect(flags.objectives.groups[0].rewards).toEqual([{ at: 'all', reward: 'game' }]);
    });

    it('limits characters with only: and party size', () => {
        const flags = parseFlags('Cstandard/start:kain/only:rydia,edge/party:3');
        const allowed = Object.entries(flags.characters.allowed).filter(([, v]) => v).map(([id]) => Number(id));
        expect(allowed).toEqual([1, 2, 10]);
        expect(flags.characters.partySize).toBe(3);
    });

    it('describes flags for display', () => {
        expect(readableSections('Kmain/summon Pkey Cstandard/no:tellah,fusoya -spoon')).toEqual([
            { title: 'Key Items', entries: ['Randomize key items', 'Mix with summon quest rewards'] },
            { title: 'Pass', entries: ['Include Pass in potential key item locations'] },
            { title: 'Characters', entries: ['Randomize characters', 'Exclude Tellah, Exclude Fusoya'] },
            { title: 'Other', entries: ['Edward can equip the Spoon'] },
        ]);
    });
});

describe('location availability', () => {
    it('opens the underworld with the Magma Key, or the Hook once Hook Route is cleared', () => {
        const { flags, settings, state } = setup('Kmain');
        let next = withKeyItems(state, KeyItem.HOOK);
        expect(visible(keyItemLocationList(next, flags, settings))).toContain(KeyItemCheck.HOOK_ROUTE);
        expect(visible(keyItemLocationList(next, flags, settings))).not.toContain(KeyItemCheck.DWARF);

        next = apply(next, { type: 'toggleKeyItemCheck', id: KeyItemCheck.HOOK_ROUTE });
        expect(visible(keyItemLocationList(next, flags, settings))).toContain(KeyItemCheck.DWARF);

        const magma = withKeyItems(state, KeyItem.MAGMA_KEY);
        const list = visible(keyItemLocationList(magma, flags, settings));
        expect(list).toContain(KeyItemCheck.DWARF);
        expect(list).not.toContain(KeyItemCheck.HOOK_ROUTE);
    });

    it('hides summon and moon checks unless flagged, and swaps Toroia for Mist with Knofree', () => {
        const ids = (flagset) => keyItemLocationList(setup(flagset).state, parseFlags(flagset), DEFAULT_SETTINGS).map((l) => l.id);
        expect(ids('Kmain')).not.toContain(KeyItemCheck.BARON_ODIN);
        expect(ids('Kmain')).not.toContain(KeyItemCheck.MOON_WHITE);
        expect(ids('Kmain')).toContain(KeyItemCheck.TOROIA);
        expect(ids('Kmain')).not.toContain(KeyItemCheck.MIST);
        expect(ids('Kmain/summon/moon/nofree')).toEqual(expect.arrayContaining([KeyItemCheck.BARON_ODIN, KeyItemCheck.MOON_WHITE, KeyItemCheck.MIST]));
        expect(ids('Kmain/nofree')).not.toContain(KeyItemCheck.TOROIA);
    });

    it('needs Mist cleared before Mist Village', () => {
        const { flags, settings, state } = setup('Kmain/nofree');
        expect(visible(keyItemLocationList(state, flags, settings))).not.toContain(KeyItemCheck.MIST);
        const next = apply(state, { type: 'toggleMist' });
        expect(visible(keyItemLocationList(next, flags, settings))).toContain(KeyItemCheck.MIST);
    });

    it('treats push B to jump as the gating key items', () => {
        const { flags, settings, state } = setup('Kmain -pushbtojump');
        const list = visible(keyItemLocationList(state, flags, settings));
        expect(list).toEqual(expect.arrayContaining([KeyItemCheck.BARON_KING, KeyItemCheck.MAGNES, KeyItemCheck.TOWER_ZOT, KeyItemCheck.HOOK_ROUTE]));
    });

    it('shows everything except Hook Route when location logic is off', () => {
        const settings = { ...DEFAULT_SETTINGS, locationLogic: false };
        const { flags, state } = setup('Kmain', settings);
        const list = visible(keyItemLocationList(state, flags, settings));
        expect(list).toContain(KeyItemCheck.SEALED_CAVE);
        expect(list).not.toContain(KeyItemCheck.HOOK_ROUTE);
    });

    it('hides free and earned characters by flag', () => {
        const ids = (flagset) => characterLocationList(setup(flagset).state, parseFlags(flagset), DEFAULT_SETTINGS).map((l) => l.id);
        expect(ids('Cnofree')).not.toContain(CharacterCheck.DAMCYAN);
        expect(ids('Cnofree')).toContain(CharacterCheck.KAIPO);
        expect(ids('Cnoearned')).toEqual([CharacterCheck.DAMCYAN, CharacterCheck.MT_ORDEALS, CharacterCheck.MYSIDIA, CharacterCheck.WATERWAY]);
    });

    it('counts down trapped chests and resets a finished location', () => {
        const { flags, settings, state } = setup('Kmain/miab/moon');
        const eblan = () => trapLocationList(next, flags, settings).find((l) => l.id === Trap.CASTLE_EBLAN);
        let next = apply(state, ...Array(3).fill({ type: 'clickTrapChest', id: Trap.CASTLE_EBLAN }));
        expect(eblan()).toMatchObject({ remaining: 0, checked: true });
        next = apply(next, { type: 'clickTrapChest', id: Trap.CASTLE_EBLAN });
        expect(eblan()).toMatchObject({ remaining: 3, checked: false });
        expect(trapLocationList(state, parseFlags('Kmain/miab'), settings).map((l) => l.id)).not.toContain(Trap.MOON_SUB);
    });

    it('asks about the warp glitch after Dwarf Castle, and "yes" clears Sealed Cave', () => {
        const { flags, settings, state } = setup('Kmain Gwarp');
        let next = apply(state, { type: 'toggleKeyItemCheck', id: KeyItemCheck.DWARF });
        expect(showWarpGlitchPrompt(next, flags, settings)).toBe(true);
        next = apply(next, { type: 'resolveWarpGlitch', used: true });
        expect(showWarpGlitchPrompt(next, flags, settings)).toBe(false);
        expect(next.keyItemChecks[KeyItemCheck.SEALED_CAVE]).toBeTruthy();
        expect(showWarpGlitchPrompt(apply(state, { type: 'toggleKeyItemCheck', id: KeyItemCheck.DWARF }), parseFlags('Kmain'), settings)).toBe(false);
    });

    it('changes Cecil and Rydia portraits from location checks', () => {
        const { flags, state } = setup('Kmain');
        expect(isCecilPaladin(state, flags)).toBe(false);
        expect(isCecilPaladin(apply(state, { type: 'toggleKeyItemCheck', id: KeyItemCheck.MT_ORDEALS }), flags)).toBe(true);
        expect(isRydiaAdult(apply(state, { type: 'toggleCharacterCheck', id: CharacterCheck.DWARF }))).toBe(true);
        expect(isRydiaAdult(apply(state, { type: 'toggleKeyItemCheck', id: KeyItemCheck.DWARF }))).toBe(true);
    });
});

describe('go mode', () => {
    it('handles every objective, including ones that need no key items', () => {
        expect(OBJECTIVES.every((o) => Array.isArray(o.requires))).toBe(true);
        // Reported failing: quest_ordeals has no key item requirements.
        const { flags, state } = setup('O1:quest_monsterking/2:quest_ordeals/random:5,tough_quest/random2:2,quest,boss/req:7/hardreq:1,2/win:crystal Kmain/moon/nofree:dwarf/unreliabledark/start:legend Pkey Crelaxed/noearned/distinct:7/start:any/no:fusoya/abilities:j/nekkie/nodupes Twildish/playable/maxtier:7/mintier:3 Sstandard/playable/always:sirens,hrglass,bacchus,starveil,cure3,illusion,coffin Bstandard/alt:gauntlet/whichburn/newscriptstats Etoggle Hrandom Gwarp/life/backrow Fweighted Aagnostic Xzonkbonus:10 Zvanilla -kit:better -kit2:freedom -kit3:hero -noadamants -spoon -smith:super,good,spoilsuper -vanilla:miabs -tweak:yanghp');
        expect(goModeStatus(state, flags).itemStatus[KeyItem.HOOK]).toBe(KeyItemGoStatus.MISSING);
    });

    it('requires the forge items, with Hook or Magma for the underworld', () => {
        const { flags, state } = setup('O1:quest_forge');
        let status = goModeStatus(withKeyItems(state, KeyItem.LEGEND), flags);
        expect(status.itemStatus[KeyItem.LEGEND]).toBe(KeyItemGoStatus.MET);
        expect(status.itemStatus[KeyItem.ADAMANT]).toBe(KeyItemGoStatus.MISSING);
        expect(status.itemStatus[KeyItem.HOOK]).toBe(KeyItemGoStatus.MISSING);
        expect(status.inGoMode).toBe(false);

        status = goModeStatus(withKeyItems(state, KeyItem.LEGEND, KeyItem.ADAMANT, KeyItem.HOOK), flags);
        expect(status.itemStatus[KeyItem.MAGMA_KEY]).toBe(KeyItemGoStatus.NONE);
        expect(status.inGoMode).toBe(true);
    });

    it('needs the Hook outright when another objective needs it alone', () => {
        const { flags, state } = setup('O1:quest_forge/2:quest_falcon');
        const status = goModeStatus(withKeyItems(state, KeyItem.LEGEND, KeyItem.ADAMANT, KeyItem.MAGMA_KEY), flags);
        expect(status.itemStatus[KeyItem.HOOK]).toBe(KeyItemGoStatus.MISSING);
    });

    it('includes chosen random objectives', () => {
        const { flags, state } = setup('Orandom:1');
        const next = apply(state, { type: 'setRandomObjective', group: 'A', slot: 0, slotKey: 'A:r0', objectiveId: idOf('quest_pass') });
        expect(goModeStatus(next, flags).itemStatus[KeyItem.PASS]).toBe(KeyItemGoStatus.MISSING);
    });

    it('counts key items without the Pass, and "used" still counts', () => {
        const { flags, state } = setup('Kmain');
        const next = withKeyItems(state, KeyItem.PASS, KeyItem.HOOK, KeyItem.HOOK);
        expect(next.keyItems[KeyItem.HOOK]).toBe(2);
        expect(keyItemCount(next, flags)).toBe(1);
    });
});

describe('5.0 flags', () => {
    // From alpha.ff4fe.com presets.
    const TSUNAMI = "OA1:quest_monsterqueen/2:quest_monsterking OB1:quest_traderat/2:quest_tradepink OC1:quest_forge/group_a:1/group_b:1 OD1:collect_ki12/2:quest_magma/3:quest_pass/group_c:all/do_all:crystal OE1:collect_boss20/2:quest_giant/group_c:all/do_all:game Kmain/summon/miab:below/nofree/latedark/force:hook/unweighted/start:legend Crelaxed/nofree/nogiant/j:abilities/nekkie/nodupes/bye Twildish/sparse:50 Sstandard Bstandard/no:cpu,wyvern Etoggle Xnokeybonus Glife";
    const LADDER = "OArandom:7,tough_quest/do_6:crystal Kmain/summon/moon Pkey Cstandard/nofree/j:abilities/nekkie Twildish Sstandard Bstandard/alt:gauntlet Etoggle Gwarp/life/sylph/backrow -kit:better -noadamants -spoon";

    it('parses objective groups, group requirements and rewards', () => {
        const flags = parseFlags(TSUNAMI);
        expect(flags.version50).toBe(true);
        expect(flags.objectives.groups.map((g) => g.id)).toEqual(['A', 'B', 'C', 'D', 'E']);
        const [, , c, d] = flags.objectives.groups;
        expect(c.items).toEqual([
            { kind: 'objective', id: idOf('quest_forge') },
            { kind: 'group', group: 'A', count: 1 },
            { kind: 'group', group: 'B', count: 1 },
        ]);
        expect(d.items[0]).toEqual({ kind: 'collect', counter: 'ki', target: 12 });
        expect(d.rewards).toEqual([{ at: 'all', reward: 'crystal' }]);
    });

    it('reads random-only groups', () => {
        const [group] = parseFlags(LADDER).objectives.groups;
        expect(group).toMatchObject({ id: 'A', rewards: [{ at: 6, reward: 'crystal' }] });
        expect(group.random).toHaveLength(1);
        expect(group.random[0].count).toBe(7);
        expect(group.random[0].categories).toEqual({ [ObjectiveCategory.QUEST]: true, [ObjectiveCategory.BOSS]: false, [ObjectiveCategory.CHARACTER]: false });
    });

    it('parses the new key item, character, boss and experience flags', () => {
        const flags = parseFlags(TSUNAMI);
        expect(flags.keyItems.start).toEqual([KeyItem.LEGEND]);
        expect([...flags.keyItems.miab]).toEqual(['below']);
        expect(flags.characters.noGiant).toBe(true);
        expect(flags.excludedBosses).toEqual(['cpu', 'wyvern']);
        expect(flags.noKeyBonus).toBe(true);
        expect(parseFlags('Kmain/forge').keyItems.forge).toBe(true);
        expect(parseFlags('Cstandard/wishes').characters.wishes).toBe(true);
    });

    it('starts with Kstart key items and counts the Pass', () => {
        const { flags, state } = setup(TSUNAMI);
        expect(state.keyItems[KeyItem.LEGEND]).toBe(1);
        expect(keyItemCount(withKeyItems(state, KeyItem.PASS), flags)).toBe(2);
    });

    it('limits trapped chests to the Kmiab zones', () => {
        const { flags, settings, state } = setup('Kmain/miab:below');
        expect(trapLocationList(state, flags, settings).map((l) => l.id)).toEqual([Trap.FEY, Trap.LOWER_BABIL, Trap.SYLPH_CAVE]);
        const all = parseFlags('Kmain/miab:all');
        expect(trapLocationList(state, all, settings).map((l) => l.id)).toContain(Trap.MOON_SUB);
    });

    it('adds the Forge check with Kforge', () => {
        const { flags, settings, state } = setup('Kmain/forge');
        expect(keyItemLocationList(state, flags, settings).map((l) => l.id)).toContain(KeyItemCheck.FORGE);
        expect(keyItemLocationList(state, parseFlags('Kmain'), settings).map((l) => l.id)).not.toContain(KeyItemCheck.FORGE);
        const ready = withKeyItems(state, KeyItem.LEGEND, KeyItem.ADAMANT, KeyItem.MAGMA_KEY);
        expect(visible(keyItemLocationList(ready, flags, settings))).toContain(KeyItemCheck.FORGE);
    });

    it('hides the Giant character check with Cnogiant', () => {
        const ids = characterLocationList(setup('Cstandard/nogiant').state, parseFlags('Cstandard/nogiant'), DEFAULT_SETTINGS).map((l) => l.id);
        expect(ids).not.toContain(CharacterCheck.GIANT_BABIL);
    });

    it('applies Cstart:not_ to the starting pool', () => {
        const flags = parseFlags('Cstandard/start:not_tellah,not_fusoya/no:fusoya,kain');
        expect(flags.characters.allowed[11]).toBe(false); // FuSoYa can't start, so stays excluded
        expect(flags.characters.allowed[1]).toBe(true); // Kain can start
    });

    it('tracks group progress, collect counters and group requirements', () => {
        const { flags, state } = setup(TSUNAMI);
        let next = apply(state,
            { type: 'toggleObjective', slotKey: 'A:f0' },
            { type: 'toggleObjective', slotKey: 'C:f0' });
        let [a, , c, d, e] = objectiveGroupProgress(next, flags);
        expect(a.completed).toBe(1);
        // Group C needs 1 from group A (done) and 1 from group B (not yet).
        expect(c.items.map((i) => i.done)).toEqual([true, true, false]);
        expect(d.items[0]).toMatchObject({ value: 1, target: 12, done: false });

        next = apply(next, { type: 'toggleObjective', slotKey: 'B:f0' }, { type: 'setCounter', counter: 'boss', value: 20 });
        [a, , c, d, e] = objectiveGroupProgress(next, flags);
        expect(c.completed).toBe(c.total);
        // Group D and E both require all of group C.
        expect(d.items[3].done).toBe(true);
        expect(e.items[0]).toMatchObject({ value: 20, done: true });
        expect(e.rewards[0].earned).toBe(false);
    });

    it('earns rewards at their thresholds', () => {
        const { flags, state } = setup('OA1:quest_magnes/2:quest_zot/3:quest_forge/do_2:ribbon/do_all:crystal');
        const next = apply(state, { type: 'toggleObjective', slotKey: 'A:f0' }, { type: 'toggleObjective', slotKey: 'A:f1' });
        const [group] = objectiveGroupProgress(next, flags);
        expect(group.rewards.map((r) => r.earned)).toEqual([true, false]);
    });

    it('lists the DkMatter quests and uses them for Go Mode', () => {
        const { flags, state } = setup('Omode_dkmatter:quests/win:crystal Kmain');
        const progress = darkMatterQuestProgress(state, flags);
        expect(progress.items).toHaveLength(14);
        expect(progress.items.reduce((sum, i) => sum + i.darkMatter, 0)).toBe(73);
        expect(progress.rewards).toEqual([{ at: 40, reward: 'crystal', earned: false }]);
        expect(goModeStatus(state, flags).itemStatus[KeyItem.DARKNESS_CRYSTAL]).toBe(KeyItemGoStatus.MISSING);
    });

    it('needs the Package for the Kaipo inn quest', () => {
        const { flags, state } = setup('OA1:quest_kaipoinn/do_all:crystal');
        expect(goModeStatus(state, flags).itemStatus[KeyItem.PACKAGE]).toBe(KeyItemGoStatus.MISSING);
    });
});

describe('4.7 Gale fork flags', () => {
    // Flag strings as written by the fork's own flag library (ff4fe.galeswift.com).
    const FORK = "Omode:classicforge,dkmatter15,ki10,bosscollector20,goldhunter250,external/2:boss_milon/random:3,quest,char,onlycecil,onlykain/random2:2,boss/random3:1,tough_quest/req:8/hardreq:1,3/gated:2/win:crystal Kmain/miab:standard/pink/nofree:package/start:baron Pkey Cstandard/nofree/no:tellah/paladin/superhero/treasure:free Tstandard Svanilla Bstandard Etoggle Xnokeybonus -doorsrando:all";
    const FORK2 = "O1:quest_forge/random:2/req:all/win:game Kmain/miab:above,lst/nofree:dwarf/start:pink Pnone Cstandard/nofree/noearned/treasure:free,earned,relaxed Tpro -starting:underground";

    it('stays a 4.x flagset (Pass not counted) despite sharing flags with 5.0', () => {
        expect(parseFlags(FORK).version50).toBe(false);
        expect(parseFlags('Kmain/forge/miab:above/start:hook/latedark Xnokeybonus').version50).toBe(false);
    });

    it("builds objectives in the fork's order, with counted modes and the EagleEye objective", () => {
        const [group] = parseFlags(FORK).objectives.groups;
        expect(group.items).toEqual([
            { kind: 'objective', id: 0, hardRequired: true },
            { kind: 'objective', id: 91, gated: true },
            { kind: 'collect', counter: 'dkmatter', target: 15, hardRequired: true },
            { kind: 'collect', counter: 'ki', target: 10 },
            { kind: 'collect', counter: 'boss', target: 20 },
            { kind: 'collect', counter: 'gp', target: 250 },
            { kind: 'objective', id: idOf('boss_milon') },
        ]);
        expect(group.rewards).toEqual([{ at: 8, reward: 'crystal' }]);
        expect(parseFlags(FORK).objectives.darkMatterCounter).toBe(true);
    });

    it('reads the three random buckets and only-character limits', () => {
        const { random } = parseFlags(FORK).objectives.groups[0];
        expect(random.map((b) => b.count)).toEqual([3, 2, 1]);
        expect(random[0].onlyCharacters).toEqual([0, 1]);
        expect(random[1].categories).toEqual({ [ObjectiveCategory.QUEST]: false, [ObjectiveCategory.BOSS]: true, [ObjectiveCategory.CHARACTER]: false });
        const { flags, state } = setup(FORK);
        const progress = objectiveGroupProgress(state, flags)[0];
        const randomItems = progress.items.filter((i) => i.kind === 'random');
        expect(randomItems.map((i) => i.slotKey)).toEqual(['A:r0', 'A:r1', 'A:r2', 'A:r3', 'A:r4', 'A:r5']);
        expect(randomItems[3].categories[ObjectiveCategory.BOSS]).toBe(true);
    });

    it('parses the fork key item and character flags', () => {
        const flags = parseFlags(FORK);
        expect(flags.keyItems).toMatchObject({ miab: 'standard', pink: true, noFree: 'package', start: [KeyItem.BARON_KEY] });
        expect(flags.characters).toMatchObject({ paladin: true, hero: true, noFree: true });
        expect(flags.mapShuffled).toBe(true);
        const two = parseFlags(FORK2);
        expect([...two.keyItems.miab]).toEqual(['above', 'lst']);
        expect(two.keyItems).toMatchObject({ noFree: 'dwarf', start: [KeyItem.PINK_TAIL] });
        expect(two.characters).toMatchObject({ noFree: true, noEarned: true });
        expect(two.startUnderground).toBe(true);
    });

    it('turns doors/entrances rando into a checklist', () => {
        const { flags, settings, state } = setup(FORK);
        const list = keyItemLocationList(state, flags, settings);
        expect(list.every((l) => l.available)).toBe(true);
        expect(list.map((l) => l.id)).not.toContain(KeyItemCheck.HOOK_ROUTE);
    });

    it('adds the Pink Tail trade check and moves the free key item', () => {
        const flags = parseFlags('Kmain/pink/nofree:dwarf');
        const { state } = setup('Kmain/pink/nofree:dwarf');
        const ids = keyItemLocationList(state, flags, DEFAULT_SETTINGS).map((l) => l.id);
        expect(ids).toEqual(expect.arrayContaining([KeyItemCheck.PINK_TRADE, KeyItemCheck.DWARF_CID]));
        expect(ids).not.toContain(KeyItemCheck.TOROIA);
        expect(ids).not.toContain(KeyItemCheck.MIST);
        const ready = withKeyItems(state, KeyItem.PINK_TAIL, KeyItem.HOOK, KeyItem.MAGMA_KEY);
        expect(visible(keyItemLocationList(ready, flags, DEFAULT_SETTINGS))).toEqual(expect.arrayContaining([KeyItemCheck.PINK_TRADE, KeyItemCheck.DWARF_CID]));
    });

    it('opens Mist Village with the Package under Knofree:package', () => {
        const { flags, state } = setup('Kmain/nofree:package');
        expect(visible(keyItemLocationList(state, flags, DEFAULT_SETTINGS))).not.toContain(KeyItemCheck.MIST);
        expect(visible(keyItemLocationList(withKeyItems(state, KeyItem.PACKAGE), flags, DEFAULT_SETTINGS))).toContain(KeyItemCheck.MIST);
    });

    it('includes Lunar Sub. trapped chests on Kmiab:standard only with Kmoon or Kunsafe', () => {
        const ids = (flagset) => trapLocationList(setup(flagset).state, parseFlags(flagset), DEFAULT_SETTINGS).map((l) => l.id);
        expect(ids('Kmain/miab:standard')).not.toContain(Trap.MOON_SUB);
        expect(ids('Kmain/miab:standard/unsafe')).toContain(Trap.MOON_SUB);
        expect(ids('Kmain/miab:standard/moon')).toContain(Trap.MOON_SUB);
    });

    it('opens the underworld from the start with -starting:underground', () => {
        const { flags, state } = setup('Kmain -starting:underground');
        expect(visible(keyItemLocationList(state, flags, DEFAULT_SETTINGS))).toContain(KeyItemCheck.DWARF);
        const forge = setup('O1:quest_forge Kmain -starting:underground');
        const status = goModeStatus(forge.state, forge.flags).itemStatus;
        expect(status[KeyItem.HOOK]).toBe(KeyItemGoStatus.NONE);
        expect(status[KeyItem.MAGMA_KEY]).toBe(KeyItemGoStatus.NONE);
    });

    it('starts Cecil as a paladin with Cpaladin', () => {
        const { flags, state } = setup('Cstandard/paladin');
        expect(isCecilPaladin(state, flags)).toBe(true);
    });

    it("names fork flags from the fork's spec", () => {
        const sections = readableSections('Kmain/pink/nofree:dwarf Cstandard/paladin -doorsrando:all');
        expect(sections.find((s) => s.title === 'Key Items').entries).toEqual(['Randomize key items', 'Pink Tail trades for a key item', 'Move key item from Toroia to Dwarf Castle']);
        expect(sections.find((s) => s.title === 'Other').entries).toEqual(['All Doors shuffled']);
    });
});
