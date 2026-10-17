import { BOSSES } from './data/bosses';
import { useTracker } from './state/TrackerContext';
import { asset } from './asset';

// Bosses you've seen this seed. Seen isn't the same as defeated, so this stays separate from objectives.
export function BossPanel() {
    const { state, flags, dispatch } = useTracker();
    const seenCount = BOSSES.filter((boss) => state.bossesSeen[boss.id]).length;

    return <div className="boss_root">
        <header className="section_header">
            <img className="section_icon" src={asset("images/img_boss.png")} alt="" />
            Bosses Seen <span className="boss_count">{seenCount}/{BOSSES.length}</span>
        </header>
        <div className="boss_grid">
            {BOSSES.map((boss) => {
                const seen = Boolean(state.bossesSeen[boss.id]);
                // 5.0 Bno: bosses won't appear, but stay clickable in case of a mistake.
                const excluded = flags.excludedBosses.includes(boss.flag);
                return <button key={boss.id} title={excluded ? `${boss.name} (excluded)` : boss.name} aria-pressed={seen}
                    className={"boss_item" + (seen ? " seen" : "") + (excluded ? " excluded" : "")}
                    onClick={() => dispatch({ type: 'toggleBoss', id: boss.id })}>
                    <img src={asset(boss.image)} alt={boss.name} />
                </button>;
            })}
        </div>
    </div>;
}
