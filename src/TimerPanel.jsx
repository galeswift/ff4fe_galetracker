import { useEffect, useState } from 'react';
import { Button } from '@radix-ui/themes';
import { elapsedMs, formatTime, splitTime } from './logic/timer';
import { useTracker } from './state/TrackerContext';

// Re-renders every animation frame while the timer runs.
function useNow(running) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        if (!running) return undefined;
        let frame;
        const tick = () => {
            setNow(Date.now());
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [running]);
    return now;
}

async function copyText(text) {
    // navigator.clipboard needs a secure context (https); fall back to a hidden textarea.
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
}

export function TimerPanel() {
    const { state, dispatch } = useTracker();
    const { timer } = state;
    const now = useNow(timer.running);
    const elapsed = elapsedMs(timer, timer.running ? Math.max(now, timer.startedAt) : now);
    const { hms, hundredths } = splitTime(elapsed);
    const started = timer.running || timer.bankedMs > 0;

    return <div className="timer_root">
        <div className={"timer_text " + (timer.running ? "timer_running" : started ? "timer_paused" : "timer_stopped")}>
            <span className="timer_hms">{hms}:</span>
            <span className="timer_ms">{hundredths}</span>
        </div>
        <div className="timer_buttons">
            {timer.running
                ? <Button size="2" variant="solid" onClick={() => dispatch({ type: 'pauseTimer' })}>Pause</Button>
                : <Button size="2" variant="solid" onClick={() => dispatch({ type: 'startTimer' })}>{started ? "Resume" : "Start"}</Button>}
            <Button size="2" variant="solid" disabled={!started} onClick={() => dispatch({ type: 'resetTimer' })}>Reset</Button>
            <Button size="2" variant="solid" onClick={() => copyText(formatTime(elapsed))}>Copy</Button>
        </div>
    </div>;
}
