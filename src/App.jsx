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
import { FeedbackLink, Footer } from './Footer';
import { ThemeToggle } from './ThemeToggle';
import { parseFlags } from './logic/flags';
import { findPreset } from './logic/presets';
import { randomObjectivesFromRom, readRomMetadata, RomMetadataError } from './logic/romMetadata';
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

function TrackerScreens({ settings, onSettingsChanged }) {
    const { dispatch } = useTracker();
    const [flagset, setFlagset] = useState(() => load(StorageKey.FLAGSET, ''));
    const [hasTracker, setHasTracker] = useState(hasSavedTracker);
    const [inTrackingMode, setTrackingMode] = useState(hasTracker);
    const [lastRomMetadata, setLastRomMetadata] = useState(null);
    const onFlagsetChanged = (value) => {
        setLastRomMetadata(null);        
        setFlagset(value);
        setRomError(null);
        save(StorageKey.FLAGSET, value);
    };

    const onResetFlags = () => {
        onFlagsetChanged('');
        dispatch({ type: 'reset', flagset: '', flags: parseFlags(''), preset: null, random: null });
        setHasTracker(false);
        setTrackingMode(false);        
    }

    const [romError, setRomError] = useState(null);
    
    const startTracker = (flagsToUse = flagset) => {
        const preset = findPreset(flagsToUse, load(StorageKey.PRESET_BRANCH, 'fork'));        
        const random = lastRomMetadata ? randomObjectivesFromRom(lastRomMetadata, parseFlags(lastRomMetadata.flags)) : null;
        dispatch({ type: 'reset', flagset: flagsToUse, flags: parseFlags(flagsToUse), preset, random });
        setHasTracker(true);
        setTrackingMode(true);
    };

    // A seed ROM carries its flags and objective list: start a tracker with the random objectives filled in.
    // The file is read in the browser only.
    const loadRom = async (file) => {
        setRomError(null);
        try {
            const meta = readRomMetadata(new Uint8Array(await file.arrayBuffer()));
            if (!meta.flags) {
                throw new RomMetadataError(meta.flagsHidden
                    ? "This seed hides its flags, so the tracker can't set itself up from the ROM. Paste the flags instead."
                    : "No flags found in this ROM.");
            }
            onFlagsetChanged(meta.flags);
            setLastRomMetadata(meta);
        } catch (error) {
            if (!(error instanceof RomMetadataError)) console.error('Loading the seed ROM failed', error);
            setRomError(error instanceof RomMetadataError ? error.message : "Couldn't read that file.");
        }
    };

    return <div className="root_panel">
        {inTrackingMode
            ? <TrackingMode />
            : <FlagScreen flagset={flagset} onFlagsetChanged={onFlagsetChanged} settings={settings} onSettingsChanged={onSettingsChanged}
                onStart={() => startTracker()} onReset={() => onResetFlags()} onLoadRom={loadRom} romError={romError} />}
        <Footer inTrackingMode={inTrackingMode}
            onTrackingModeChanged={() => setTrackingMode(!inTrackingMode)} canTrack={hasTracker} />
        <FeedbackLink />
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
                <ThemeToggle darkMode={darkMode} onDarkModeChanged={onDarkModeChanged} />
                <TrackerScreens settings={settings} onSettingsChanged={onSettingsChanged} />
            </TrackerProvider>
        </Theme>
    );
}

export default App;
