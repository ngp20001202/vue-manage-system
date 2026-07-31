import { DEV_TARGET } from './devTarget.js';

export function getoriginurl(): string {
    return (
        localStorage.getItem('baseURL') ||
        (import.meta.env.DEV ? DEV_TARGET : window.location.origin)
    );
}