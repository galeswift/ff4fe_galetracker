import { useState } from 'react';
import { Button, Switch, Tabs, Text } from '@radix-ui/themes';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import PRESETS from './data/presets.json';
import { sameFlags } from './logic/presets';
import { SETTING_DESCRIPTIONS } from './state/settings';
import { load, save, StorageKey } from './state/storage';

// A preset category, collapsed until tapped so the list stays short.
function PresetCategory({ category, flagset, onPick }) {
    const containsCurrent = category.presets.some((p) => sameFlags(flagset, p.flags));
    const [open, setOpen] = useState(containsCurrent);
    return <div className={"preset_category" + (open ? " open" : "")}>
        <button className="preset_category_toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
            <ChevronRightIcon className="preset_chevron" width="18" height="18" />
            <span className="preset_category_name">{category.name}</span>
            <span className="preset_count">{category.presets.length}</span>
        </button>
        {open && <div className="preset_buttons">
            {category.presets.map((preset) => <Button key={preset.name} size="2"
                variant={sameFlags(flagset, preset.flags) ? "solid" : "outline"}
                title={preset.description || preset.flags}
                onClick={() => onPick(preset.flags)}>{preset.name}</Button>)}
        </div>}
    </div>;
}

// Each Free Enterprise site's presets (snapshot in src/data/presets.json), one tab per branch.
function PresetPicker({ flagset, onPick }) {
    const [branch, setBranch] = useState(() => load(StorageKey.PRESET_BRANCH, 'fork'));
    const chooseBranch = (value) => {
        setBranch(value);
        save(StorageKey.PRESET_BRANCH, value);
    };

    return <Tabs.Root value={branch} onValueChange={chooseBranch} className="preset_picker">
        <Tabs.List justify="center" size="2">
            {PRESETS.branches.map((b) => <Tabs.Trigger key={b.id} value={b.id} title={b.site}>{b.name}</Tabs.Trigger>)}
        </Tabs.List>
        {PRESETS.branches.map((b) => <Tabs.Content key={b.id} value={b.id} className="preset_branch">
            {b.sections.map((section, index) => <div key={section.header ?? index} className="preset_section">
                {section.header && <div className="preset_section_header">{section.header}</div>}
                {section.categories.map((category) =>
                    <PresetCategory key={category.name} category={category} flagset={flagset} onPick={onPick} />)}
            </div>)}
        </Tabs.Content>)}
    </Tabs.Root>;
}

export function FlagScreen({ flagset, onFlagsetChanged, settings, onSettingsChanged, onStart, canResume, onResume }) {
    const setSetting = (key, value) => onSettingsChanged({ ...settings, [key]: value });

    return <div className="flagset_mode_root">
        <header className="section_header">Enter Flagset</header>
        <textarea className="flagset_text_area" placeholder="Enter Flagset Here" value={flagset}
            onChange={(event) => onFlagsetChanged(event.target.value)} />

        <div className="flag_buttons">
            <Button size="3" onClick={onStart} disabled={flagset.trim() === ''}>Start New Tracker</Button>
            {canResume && <Button size="3" variant="soft" onClick={onResume}>Back to Current Tracker</Button>}
        </div>

        <header className="section_header">Presets</header>
        <PresetPicker flagset={flagset} onPick={onFlagsetChanged} />

        <header className="section_header">Options</header>
        <div className="settings_list">
            {SETTING_DESCRIPTIONS.map(({ key, label, help }) => <label key={key} className="setting_row">
                <Switch color="green" checked={settings[key]} onCheckedChange={(value) => setSetting(key, value)} />
                <span>
                    <Text as="div" size="3">{label}</Text>
                    <Text as="div" size="1" color="gray" className="setting_help">{help}</Text>
                </span>
            </label>)}
        </div>
    </div>;
}
