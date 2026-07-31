const DEV_TARGET = window.location.origin;

export function getoriginurl(): string {
    return (
        localStorage.getItem('baseURL') ||
        (import.meta.env.DEV ? DEV_TARGET : window.location.origin)
    );
}