import { KEY_ITEMS, KeyItemState } from './data/keyItems';
import { goModeStatus, hasKeyItemBonus, KeyItemGoStatus, keyItemCount, maxKeyItems } from './logic/goMode';
import { NoFreeKeyItem } from './logic/flags';
import { useTracker } from './state/TrackerContext';
import { asset } from './asset';

const STATE_CLASS = {
    [KeyItemState.NONE]: "ki_unowned",
    [KeyItemState.FOUND]: "ki_owned",
    [KeyItemState.USED]: "ki_owned ki_used",
};

function MistToggle() {
    const { state, dispatch } = useTracker();
    return <button className={"ki_item mist_toggle " + (state.mist ? "ki_owned" : "ki_unowned")}
        title="Mist Dragon defeated (opens Mist Village)" onClick={() => dispatch({ type: 'toggleMist' })}>
        <img src={asset(state.mist ? "images/mistdragon.png" : "images/mistdragon_2.png")} alt="Mist Dragon" />
    </button>;
}

export function KIPanel() {
    const { state, flags, settings, dispatch } = useTracker();
    const { itemStatus } = goModeStatus(state, flags);
    const showGoMode = settings.objectiveTracking;

    return <div className="ki_root">
        {KEY_ITEMS.map((keyItem) => {
            const value = state.keyItems[keyItem.id];
            const go = showGoMode ? itemStatus[keyItem.id] : KeyItemGoStatus.NONE;
            return <button key={keyItem.id} title={keyItem.name}
                className={`ki_item ${STATE_CLASS[value]} go_${go}`}
                onClick={() => dispatch({ type: 'cycleKeyItem', keyItem: keyItem.id })}>
                <img src={asset(keyItem.image)} alt={keyItem.name} />
                {value === KeyItemState.USED && <img className="ki_done" src={asset("images/done.png")} alt="" />}
            </button>;
        })}
        {flags.keyItems.noFree === NoFreeKeyItem.MIST && <MistToggle />}
        <div className={"ki_count" + (hasKeyItemBonus(state, flags) ? " ki_bonus" : "")}>
            {keyItemCount(state, flags)}/{maxKeyItems(flags)}
        </div>
    </div>;
}

export function GoModeBanner() {
    const { state, flags } = useTracker();
    const { inGoMode } = goModeStatus(state, flags);
    return <div className={"go_mode" + (inGoMode ? " in_go_mode" : "")} aria-hidden={!inGoMode}>
        <div className="go_mode_banner"><span className="go_mode_text">Go Mode!</span></div>
        {/* The Enterprise flies back and forth under the banner. */}
        <div className="go_mode_flight">
            <span className="go_mode_ship"><img src={asset("images/img_objective.png")} alt="" /></span>
        </div>
    </div>;
}
