import { useMemo, useRef, useState } from 'react';
import { Button, Switch, Tabs, Text } from '@radix-ui/themes';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import PRESETS from './data/presets.json';
import { sameFlags } from './logic/presets';
import { checkFlags } from './logic/flagCheck';
import { parseFlags } from './logic/flags';
import VALID_FLAGS from './data/validFlags.json';
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

// Load a seed ROM by button or by dropping it anywhere on the flag screen.
function RomLoader({ onLoadRom, error }) {
    const input = useRef(null);
    return <div className="rom_loader">
        <Button size="3" variant="solid" onClick={() => input.current.click()}>Upload ROM</Button>        
        {error && <Text size="2" color="red" className="rom_loader_error">{error}</Text>}
        <input ref={input} type="file" accept=".smc,.sfc" hidden
            onChange={(event) => { if (event.target.files[0]) onLoadRom(event.target.files[0]); event.target.value = ''; }} />
    </div>;
}

// Flags none of the FE sites would accept, checked against the version they fit best.
function FlagCheck({ flagset }) {
    const result = useMemo(() => checkFlags(flagset, VALID_FLAGS, parseFlags(flagset).version50), [flagset]);
    if (!result) return null;
    if (result.unknown.length === 0) {
        return <Text as="div" size="2" color="green" className="flag_check">All flags recognised for {result.branchName}</Text>;
    }
    return <div className="flag_check">
        {result.unknown.map((flag) => <Text key={flag} as="div" size="2" color="amber">Unknown flag {flag} for {result.branchName}</Text>)}
    </div>;
}

export function FlagScreen({ flagset, onFlagsetChanged, settings, onSettingsChanged, onStart, onReset, onLoadRom, romError }) {
    const setSetting = (key, value) => onSettingsChanged({ ...settings, [key]: value });
    const [dragging, setDragging] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const onDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) onLoadRom(file);
    };

    const onTryReset = () => { setShowResetConfirm(true); };

    return <div className={"flagset_mode_root" + (dragging ? " dragging" : "")}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
        onDrop={onDrop}>
        <header className="section_header">Enter Flagset</header>
        <textarea className="flagset_text_area" placeholder="Enter Flagset Here" value={flagset}
            onChange={(event) => onFlagsetChanged(event.target.value)} />
        <FlagCheck flagset={flagset} />

        <div className="flag_buttons">
            <RomLoader onLoadRom={onLoadRom} error={romError} />
            <Button size="3" onClick={onStart} disabled={flagset.trim() === ''}>Apply Flags</Button>            
            {!showResetConfirm && <Button size="3" onClick={onTryReset}>Reset All</Button> }
            {showResetConfirm && <Button size="3" onClick={() => { onReset(); setShowResetConfirm(false); }}>Are you sure?</Button>}
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
