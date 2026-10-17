// The timer is stored as banked time plus the moment it was last started, so it keeps
// counting across reloads and never drifts.
export function initialTimer() {
    return { running: false, startedAt: 0, bankedMs: 0 };
}

export function elapsedMs(timer, now = Date.now()) {
    return timer.bankedMs + (timer.running ? now - timer.startedAt : 0);
}

export function startTimer(timer, now = Date.now()) {
    return timer.running ? timer : { ...timer, running: true, startedAt: now };
}

export function pauseTimer(timer, now = Date.now()) {
    return timer.running ? { running: false, startedAt: 0, bankedMs: elapsedMs(timer, now) } : timer;
}

export function splitTime(ms) {
    const pad = (n) => String(n).padStart(2, '0');
    const totalSeconds = Math.floor(ms / 1000);
    return {
        hms: `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor(totalSeconds / 60) % 60)}:${pad(totalSeconds % 60)}`,
        hundredths: pad(Math.floor((ms % 1000) / 10)),
    };
}

export function formatTime(ms) {
    return splitTime(ms).hms;
}
