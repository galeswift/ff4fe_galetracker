import { useMemo, useState } from 'react';
import { Popover, Switch, Tabs, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon, MinusIcon, MixerHorizontalIcon, PlusIcon } from '@radix-ui/react-icons';
import { CollectKind, OBJECTIVES, ObjectiveCategory } from './data/objectives';
import { ObjectiveItemKind, objectiveItemName, rewardName } from './logic/flags';
import { darkMatterQuestProgress, objectiveGroupProgress } from './logic/objectives';
import { formatTime } from './logic/timer';
import { useTracker } from './state/TrackerContext';

const RANDOM_CATEGORIES = [
    { category: ObjectiveCategory.QUEST, label: "Quests" },
    { category: ObjectiveCategory.BOSS, label: "Boss Hunts" },
    { category: ObjectiveCategory.CHARACTER, label: "Character Hunts" },
];

// Counters the player updates by hand. GP is counted in thousands, as the objectives are.
const MANUAL_COUNTERS = {
    [CollectKind.BOSSES]: { step: 1 },
    [CollectKind.CHESTS]: { step: 1 },
    [CollectKind.GP]: { step: 10, unit: "k GP" },
};

function Counter({ value, onChange, step = 1, label }) {
    return <span className="counter">
        <button className="IconButton" aria-label={`Less ${label}`} onClick={() => onChange(value - step)}><MinusIcon /></button>
        <input className="counter_value" type="number" min="0" value={value} aria-label={label}
            onChange={(event) => onChange(Number(event.target.value) || 0)} />
        <button className="IconButton" aria-label={`More ${label}`} onClick={() => onChange(value + step)}><PlusIcon /></button>
    </span>;
}

function ObjectiveRow({ item, children, extra }) {
    const { dispatch } = useTracker();
    return <div className={"objective_single_root" + (item.done ? " completed" : "")}>
        <label className="objective_text">
            <Switch color="green" checked={item.done} onCheckedChange={() => dispatch({ type: 'toggleObjective', slotKey: item.slotKey })} />
            <span className="objective_name">{children}</span>
        </label>
        {item.time != null && <span className="timestamp">{formatTime(item.time)}</span>}
        {extra}
    </div>;
}

// Rows that complete themselves (collect objectives, other-group requirements).
function AutoRow({ item, children, extra }) {
    return <div className={"objective_single_root" + (item.done ? " completed" : "")}>
        <span className="objective_text auto">
            <Switch color="green" checked={item.done} disabled />
            <span className="objective_name">{children}</span>
        </span>
        {extra}
    </div>;
}

function CollectRow({ item }) {
    const { state, dispatch } = useTracker();
    const manual = MANUAL_COUNTERS[item.counter];
    const progress = <span className="collect_progress">{item.value}/{item.target}{manual?.unit ? ` ${manual.unit}` : ''}</span>;
    const counter = manual && <Counter value={state.objectives.counters[item.counter]} step={manual.step} label={item.counter}
        onChange={(value) => dispatch({ type: 'setCounter', counter: item.counter, value })} />;
    return <AutoRow item={item} extra={<>{progress}{counter}</>}>{objectiveItemName(item)}</AutoRow>;
}

function ObjectivePicker({ categories, onPick }) {
    const allowed = RANDOM_CATEGORIES.filter(({ category }) => categories[category]);
    const [category, setCategory] = useState(allowed[0]?.category ?? ObjectiveCategory.QUEST);
    const [filter, setFilter] = useState('');

    const matches = useMemo(() => {
        const words = filter.toLowerCase().split(' ').filter((w) => w !== '');
        return OBJECTIVES
            .filter((o) => o.category === category)
            .filter((o) => words.every((w) => o.name.toLowerCase().includes(w)))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [category, filter]);

    const onKeyDown = (event) => {
        if (event.key === 'Enter' && matches.length > 0) onPick(matches[0].id);
    };

    return <div className="objective_picker">
        <Tabs.Root value={category} onValueChange={setCategory}>
            <Tabs.List size="1">
                {RANDOM_CATEGORIES.map(({ category: c, label }) => {
                    const disabled = !categories[c];
                    return <Tabs.Trigger key={c} value={c} disabled={disabled} className={disabled ? "category_disabled" : ""}>{label}</Tabs.Trigger>;
                })}
            </Tabs.List>
        </Tabs.Root>
        <TextField.Root className="objective_search" placeholder="Search by name..." autoFocus value={filter}
            onChange={(event) => setFilter(event.target.value)} onKeyDown={onKeyDown}>
            <TextField.Slot><MagnifyingGlassIcon height="16" width="16" /></TextField.Slot>
        </TextField.Root>
        <div className="objective_popup">
            {matches.map((o) => <button key={o.id} className="objective_selector_item" onClick={() => onPick(o.id)}>{o.name}</button>)}
        </div>
    </div>;
}

function RandomObjectiveRow({ group, item }) {
    const { dispatch } = useTracker();
    const [open, setOpen] = useState(false);

    const pick = (objectiveId) => {
        dispatch({ type: 'setRandomObjective', group: group.id, slot: item.slot, slotKey: item.slotKey, objectiveId });
        setOpen(false);
    };

    const picker = <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
            <button className="IconButton" aria-label="Choose objective" title="Choose objective"><MixerHorizontalIcon /></button>
        </Popover.Trigger>
        <Popover.Content side="right" sideOffset={5} maxWidth="min(420px, 90vw)">
            <ObjectivePicker categories={group.categories} onPick={pick} />
        </Popover.Content>
    </Popover.Root>;

    return <ObjectiveRow item={item} extra={picker}>
        {item.id === null ? <span className="unset">[Set Random Objective {item.slot + 1}]</span> : OBJECTIVES[item.id].name}
    </ObjectiveRow>;
}

function GroupItem({ group, item }) {
    switch (item.kind) {
        case 'random': return <RandomObjectiveRow group={group} item={item} />;
        case ObjectiveItemKind.COLLECT: return <CollectRow item={item} />;
        case ObjectiveItemKind.GROUP: return <AutoRow item={item}>{objectiveItemName(item)}</AutoRow>;
        default: return <ObjectiveRow item={item}>{OBJECTIVES[item.id].name}</ObjectiveRow>;
    }
}

function Rewards({ rewards }) {
    return <span className="rewards">
        {rewards.map(({ at, reward, earned }, index) =>
            <span key={index} className={"reward_chip" + (earned ? " earned" : "")}>{at === 'all' ? 'All' : at} → {rewardName(reward)}</span>)}
    </span>;
}

function ObjectiveGroup({ group, showTitle }) {
    return <div className="objective_group">
        <div className="objective_group_header">
            {showTitle && <span className="objective_group_title">Group {group.id}</span>}
            <span className="objective_group_count">{group.completed}/{group.total}</span>
            <Rewards rewards={group.rewards} />
        </div>
        {group.items.map((item) => <GroupItem key={item.slotKey} group={group} item={item} />)}
    </div>;
}

function DarkMatterCounter({ target }) {
    const { state, dispatch } = useTracker();
    return <div className="dark_matter">
        <span>DkMatter turned in</span>
        <Counter value={state.objectives.darkMatter} label="DkMatter" onChange={(value) => dispatch({ type: 'setDarkMatter', value })} />
        {target && <span className="collect_progress">/{target}</span>}
    </div>;
}

function DarkMatterQuests({ progress }) {
    return <div className="objective_group">
        <div className="objective_group_header">
            <span className="objective_group_title">DkMatter Quests</span>
            <Rewards rewards={progress.rewards} />
        </div>
        {progress.items.map((item) => <ObjectiveRow key={item.slotKey} item={item}
            extra={<span className="collect_progress">+{item.darkMatter}</span>}>{OBJECTIVES[item.id].name}</ObjectiveRow>)}
    </div>;
}

export function ObjectivePanel() {
    const { state, flags } = useTracker();
    const groups = objectiveGroupProgress(state, flags);
    const darkMatterQuests = darkMatterQuestProgress(state, flags);
    const showGroupTitles = flags.version50 || groups.length > 1;

    return <div className="objective_root">
        <header className="section_header">Objectives</header>
        {flags.objectives.darkMatterCounter && <DarkMatterCounter target={darkMatterQuests?.target} />}
        {darkMatterQuests && <DarkMatterQuests progress={darkMatterQuests} />}
        {groups.map((group) => <ObjectiveGroup key={group.id} group={group} showTitle={showGroupTitles} />)}
        {groups.length === 0 && !darkMatterQuests && <div className="empty_note">No objectives in these flags</div>}
    </div>;
}
