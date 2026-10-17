import { useState } from 'react';
import { Popover } from '@radix-ui/themes';
import { CECIL, CHARACTERS, EMPTY_SLOT_IMAGE, RYDIA } from './data/characters';
import { isCecilPaladin, isRydiaAdult } from './logic/availability';
import { useTracker } from './state/TrackerContext';
import { asset } from './asset';

function usePortrait() {
    const { state, flags } = useTracker();
    const paladin = isCecilPaladin(state, flags);
    const adult = isRydiaAdult(state);
    return (character) => {
        const useAlt = (character.id === CECIL && paladin) || (character.id === RYDIA && adult);
        return asset(useAlt ? character.altImage : character.image);
    };
}

function CharacterPicker({ onPick }) {
    const { flags } = useTracker();
    const portrait = usePortrait();
    // Hero mode doesn't grey out excluded characters (matches fftracker).
    const isExcluded = (character) => !flags.characters.hero && !flags.characters.allowed[character.id];

    return <div className="character_picker">
        {CHARACTERS.map((character) => {
            const excluded = isExcluded(character);
            return <button key={character.id} className={"character_choice" + (excluded ? " excluded" : "")}
                disabled={excluded} title={character.name} onClick={() => onPick(character.id)}>
                <img src={portrait(character)} alt={character.name} />
                {excluded && <img className="character_x" src={asset("images/character_x.png")} alt="" />}
            </button>;
        })}
    </div>;
}

function PartySlot({ slot }) {
    const { state, flags, dispatch } = useTracker();
    const portrait = usePortrait();
    const [open, setOpen] = useState(false);
    const member = state.party[slot];
    const character = CHARACTERS[member];
    const isHero = slot === 0 && flags.characters.hero;

    const setMember = (id) => {
        dispatch({ type: 'setPartyMember', slot, character: id });
        setOpen(false);
    };

    return <div className="party_slot">
        {isHero && <div className="hero_label">Hero</div>}
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger>
                <button className={"character_panel" + (isHero ? " hero" : "")} title={character?.name ?? "Choose party member"}>
                    <img className="character_image" src={character ? portrait(character) : asset(EMPTY_SLOT_IMAGE)} alt={character?.name ?? "Empty slot"} />
                </button>
            </Popover.Trigger>
            <Popover.Content maxWidth="360px">
                <CharacterPicker onPick={setMember} />
            </Popover.Content>
        </Popover.Root>
        {character && <button className="party_clear" title="Remove" onClick={() => setMember(-1)}>×</button>}
    </div>;
}

export function CharacterPanel() {
    const { state } = useTracker();
    return <div className="character_root">
        {state.party.map((_, slot) => <PartySlot key={slot} slot={slot} />)}
    </div>;
}
