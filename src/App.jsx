import { useEffect, useState } from 'react';
import './App.css';
import '@radix-ui/themes/styles.css';
import { Separator, Theme } from '@radix-ui/themes';
import { CharacterPanel } from './CharacterPanel';
import { GoModeBanner, KIPanel } from './KIPanel';
import { LocationPanel } from './LocationPanel';
import { TimerPanel } from './TimerPanel';
import { ObjectivePanel } from './ObjectivePanel';
import { BossPanel } from './BossPanel';
import { FlagScreen } from './FlagScreen';
import { Footer } from './Footer';
import { parseFlags } from './logic/flags';
import { findPreset } from './logic/presets';
import { DEFAULT_SETTINGS } from './state/settings';
import { load, save, StorageKey } from './state/storage';
import { hasSavedTracker, TrackerProvider, useTracker } from './state/TrackerContext';

function TrackingMode() {
    const { settings } = useTracker();
    return <>
        {settings.characterTracking && <>
            <CharacterPanel />
            <Separator size="4" />
        </>}
        <div className="tracker_section">
            {settings.objectiveTracking && <ObjectivePanel />}
            <div className="ki_column">
                <KIPanel />
                {settings.objectiveTracking && <GoModeBanner />}
            </div>
        </div>
        {settings.enhancedTracking && <>
            <Separator size="4" />
            <LocationPanel />
            {settings.bossTracking && <>
                <Separator size="4" />
                <BossPanel />
            </>}
        </>}
        <Separator size="4" />
        <TimerPanel />
        <PresetBand />
    </>;
}

// Which preset this seed's flags came from, under the timer.
function PresetBand() {
    const { state } = useTracker();
    if (!state.preset) return null;
    return <div className="preset_band">
        <span className="preset_band_name">{state.preset.name}</span>
        <span className="preset_band_branch">{state.preset.branch}</span>
    </div>;
}

function TrackerScreens({ settings, onSettingsChanged, onDarkModeChanged }) {
    const { dispatch } = useTracker();
    const [flagset, setFlagset] = useState(() => load(StorageKey.FLAGSET, ''));
    const [hasTracker, setHasTracker] = useState(hasSavedTracker);
    const [inTrackingMode, setTrackingMode] = useState(hasTracker);

    const onFlagsetChanged = (value) => {
        setFlagset(value);
        save(StorageKey.FLAGSET, value);
    };

    const startTracker = () => {
        const preset = findPreset(flagset, load(StorageKey.PRESET_BRANCH, 'fork'));
        dispatch({ type: 'reset', flagset, flags: parseFlags(flagset), preset });
        setHasTracker(true);
        setTrackingMode(true);
    };

    return <div className="root_panel">
        {inTrackingMode
            ? <TrackingMode />
            : <FlagScreen flagset={flagset} onFlagsetChanged={onFlagsetChanged} settings={settings} onSettingsChanged={onSettingsChanged}
                onStart={startTracker} canResume={hasTracker} onResume={() => setTrackingMode(true)} />}
        <Footer inTrackingMode={inTrackingMode} onDarkModeChanged={onDarkModeChanged}
            onTrackingModeChanged={() => setTrackingMode(!inTrackingMode)} canTrack={hasTracker} />
    </div>;
}

function App() {
    const [darkMode, setDarkMode] = useState(() => load(StorageKey.DARK_MODE, false));
    const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...load(StorageKey.SETTINGS, {}) }));

    useEffect(() => {
        document.body.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const onDarkModeChanged = () => {
        save(StorageKey.DARK_MODE, !darkMode);
        setDarkMode(!darkMode);
    };

    const onSettingsChanged = (value) => {
        save(StorageKey.SETTINGS, value);
        setSettings(value);
    };

    return (
        <Theme appearance='inherit' accentColor="gray" panelBackground="translucent">
            <TrackerProvider initialFlagset={load(StorageKey.FLAGSET, '')} settings={settings}>
                <TrackerScreens settings={settings} onSettingsChanged={onSettingsChanged} onDarkModeChanged={onDarkModeChanged} />
            </TrackerProvider>
        </Theme>
    );
}

export default App;
