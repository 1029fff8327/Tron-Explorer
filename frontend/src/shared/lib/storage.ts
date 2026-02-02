const KEY = 'accessToken';
const AUTH_EVENT = 'auth:changed';

function emitAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export const tokenStorage = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(KEY);
  },
  set(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY, token);
    emitAuthChanged();
  },
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY);
    emitAuthChanged();
  },
};

export const authEvents = {
  name: AUTH_EVENT,
};
