// Public assets live under Vite's base path (the site root in production).
export function asset(path) {
    return import.meta.env.BASE_URL + path;
}
