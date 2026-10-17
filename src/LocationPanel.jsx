import { Callout, Separator } from '@radix-ui/themes';
import {
    characterLocationList, keyItemLocationList, showCharacterLocations, showTrapChests, showWarpGlitchPrompt, trapLocationList,
} from './logic/availability';
import { formatTime } from './logic/timer';
import { LocationView } from './state/trackerReducer';
import { useTracker } from './state/TrackerContext';
import { asset } from './asset';

function LocationItem({ location, label, onClick }) {
    return <button className={`location_item region_${location.region}`} onClick={onClick}>
        {label ?? location.name}
        {location.timestamp != null && <span className="timestamp">[{formatTime(location.timestamp)}]</span>}
    </button>;
}

function WarpGlitchPrompt() {
    const { dispatch } = useTracker();
    const resolve = (used) => dispatch({ type: 'resolveWarpGlitch', used });
    return <div className="location_item region_underworld warp_prompt">
        Warp Glitch?
        <button onClick={() => resolve(true)}>[Yes]</button>
        <button onClick={() => resolve(false)}>[No]</button>
    </div>;
}

// Shows reachable unchecked locations, or every checked location so a mistaken check can be undone.
function LocationColumn({ title, image, column, locations, onClickLocation, label, prompt }) {
    const { state, dispatch } = useTracker();
    const view = state.views[column];
    const showingChecked = view === LocationView.CHECKED;
    const shown = locations.filter((l) => (showingChecked ? l.checked : l.available && !l.checked));
    const toggleView = () => dispatch({ type: 'setView', column, view: showingChecked ? LocationView.UNCHECKED : LocationView.CHECKED });

    return <div className="location_column">
        <img className="location_header_image" src={asset(image)} alt="" />
        <header className="section_header">{title}</header>
        <Separator size="4" />
        <div className="location_list">
            {!showingChecked && prompt}
            {shown.map((location) =>
                <LocationItem key={location.id} location={location} label={label?.(location, showingChecked)} onClick={() => onClickLocation(location)} />)}
            {shown.length === 0 && !(prompt && !showingChecked) && <div className="empty_note">{showingChecked ? "Nothing checked yet" : "Nothing available"}</div>}
        </div>
        <button className="view_toggle" onClick={toggleView}>= View {showingChecked ? "Unchecked" : "Checked"} =</button>
    </div>;
}

export function LocationPanel() {
    const { state, flags, settings, dispatch } = useTracker();
    const warpPrompt = showWarpGlitchPrompt(state, flags, settings);

    return <>
    {flags.mapShuffled && <Callout.Root size="1" color="amber" className="map_shuffled_note">
        <Callout.Text>Doors or entrances are shuffled, so every location is listed without key item logic.</Callout.Text>
    </Callout.Root>}
    <div className="location_root">
        <LocationColumn title="Key Items" image="images/img_objective.png" column="keyItems"
            locations={keyItemLocationList(state, flags, settings)}
            onClickLocation={(l) => dispatch({ type: 'toggleKeyItemCheck', id: l.id })}
            prompt={warpPrompt && <WarpGlitchPrompt />} />
        {showCharacterLocations(flags) && <>
            <Separator size="4" orientation="vertical" />
            <LocationColumn title="Characters" image="images/img_character.png" column="characters"
                locations={characterLocationList(state, flags, settings)}
                onClickLocation={(l) => dispatch({ type: 'toggleCharacterCheck', id: l.id })} />
        </>}
        {showTrapChests(flags) && <>
            <Separator size="4" orientation="vertical" />
            <LocationColumn title="Trapped Chests" image="images/img_chest.png" column="traps"
                locations={trapLocationList(state, flags, settings)}
                onClickLocation={(l) => dispatch({ type: 'clickTrapChest', id: l.id })}
                label={(l, showingChecked) => (showingChecked ? l.name : `${l.name} [${l.remaining}]`)} />
        </>}
    </div>
    </>;
}
