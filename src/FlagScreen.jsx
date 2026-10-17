import { Button, Switch, Text } from '@radix-ui/themes';
import { SETTING_DESCRIPTIONS } from './state/settings';

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
