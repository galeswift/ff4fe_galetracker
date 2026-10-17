import { useMemo } from 'react';
import { Button, Dialog, Flex, TextArea } from '@radix-ui/themes';
import { readableSections } from './logic/flags';
import { useTracker } from './state/TrackerContext';

const FEEDBACK_URL = "https://discord.com/users/172845476180262913";

function NotesDialog() {
    const { state, dispatch } = useTracker();
    return <Dialog.Root>
        <Dialog.Trigger><Button size="2">Notes</Button></Dialog.Trigger>
        <Dialog.Content maxWidth="560px">
            <Dialog.Title>Notes</Dialog.Title>
            <TextArea className="notes_text" size="3" rows={12} placeholder="Anything you want to remember this seed..."
                value={state.notes} onChange={(event) => dispatch({ type: 'setNotes', notes: event.target.value })} />
            <Flex justify="end" mt="3"><Dialog.Close><Button>Done</Button></Dialog.Close></Flex>
        </Dialog.Content>
    </Dialog.Root>;
}

function FlagsDialog() {
    const { state } = useTracker();
    // Names come from Free Enterprise's flag spec (src/data/flagNames.json).
    const sections = useMemo(() => readableSections(state.flagset), [state.flagset]);
    return <Dialog.Root>
        <Dialog.Trigger><Button size="2">Show Flags</Button></Dialog.Trigger>
        <Dialog.Content maxWidth="560px">
            <Dialog.Title>Flags</Dialog.Title>
            {sections.map((section) => <div key={section.title} className="flag_section">
                <div className="flag_section_title">{section.title}</div>
                <div>{section.entries.join(', ')}</div>
            </div>)}
            <Flex justify="end" mt="3"><Dialog.Close><Button>Close</Button></Dialog.Close></Flex>
        </Dialog.Content>
    </Dialog.Root>;
}

export function Footer({ inTrackingMode, canTrack, onDarkModeChanged, onTrackingModeChanged }) {
    return <div className="root_footer">
        <Button size="2" onClick={onDarkModeChanged}>Dark Mode</Button>
        {(inTrackingMode || canTrack) && <Button size="2" onClick={onTrackingModeChanged}>{inTrackingMode ? "Flags" : "Tracker"}</Button>}
        {inTrackingMode && <NotesDialog />}
        {inTrackingMode && <FlagsDialog />}
        <Button size="2" asChild><a href={FEEDBACK_URL} target="_blank" rel="noreferrer">Feedback</a></Button>
    </div>;
}
