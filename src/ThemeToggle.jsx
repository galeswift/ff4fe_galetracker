import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

// Small pill in the top-right corner that switches between light and dark, like the draft site's.
export function ThemeToggle({ darkMode, onDarkModeChanged }) {
    const label = darkMode ? "Dark mode" : "Light mode";
    const next = darkMode ? "light mode" : "dark mode";
    return <button className="theme_toggle" onClick={onDarkModeChanged}
        title={`${label} (click for ${next})`} aria-label={`${label}; switch to ${next}`}>
        {darkMode ? <MoonIcon width="14" height="14" /> : <SunIcon width="14" height="14" />}
        <span className="theme_toggle_label">{label}</span>
    </button>;
}
