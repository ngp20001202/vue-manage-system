import { DEV_TARGET } from './devTarget.js';

export function getoriginurl(): string {
    return (
        localStorage.getItem('baseURL') ||
        DEV_TARGET
    );
}