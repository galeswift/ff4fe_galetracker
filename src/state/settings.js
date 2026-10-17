// Optional tracking features, formerly the launcher's "Disable ..." switches.
export const DEFAULT_SETTINGS = {
    characterTracking: true,
    objectiveTracking: true,
    // Off turns the location lists into a plain checklist (everything shown regardless of key items).
    locationLogic: true,
    bossTracking: true,
    // Off hides the location lists and boss tracker, leaving party, key items and objectives.
    enhancedTracking: true,
};

export const SETTING_DESCRIPTIONS = [
    { key: 'characterTracking', label: "Character tracking", help: "Party portraits." },
    { key: 'objectiveTracking', label: "Objective tracking", help: "Objective list and Go Mode." },
    { key: 'locationLogic', label: "Location logic", help: "Off shows every location regardless of key items, so you can check things off early (2v2)." },
    { key: 'bossTracking', label: "Boss tracking", help: "Grid of bosses you've seen." },
    { key: 'enhancedTracking', label: "Enhanced tracking", help: "Off hides the location lists and boss tracker." },
];
