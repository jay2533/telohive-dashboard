import type { AuthSession, User } from '@/types';

const STORAGE_KEY = 'telohive_session';
const COOKIE_NAME = 'telohive_auth';

// ── Cookie helpers (browser-only) ─────────────────────────────────────────────

function setCookie(name: string, value: string, days: number): void {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Persists a session in localStorage and sets a `telohive_auth` cookie so that
 * the server-side proxy can gate protected routes without touching localStorage.
 */
export function saveSession(user: User, rememberMe = true): AuthSession {
  const ttlDays = rememberMe ? 7 : 1;
  const session: AuthSession = {
    user,
    accessToken: `mock-at-${Date.now()}`,
    refreshToken: `mock-rt-${Date.now()}`,
    expiresAt: Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setCookie(COOKIE_NAME, '1', ttlDays);
  }

  return session;
}

/** Returns the current session or `null` when expired / absent. */
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AuthSession;
    if (session.expiresAt < Math.floor(Date.now() / 1000)) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

/** Removes the session from localStorage and clears the auth cookie. */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    clearCookie(COOKIE_NAME);
  }
}

/** `true` when a valid, non-expired session exists. */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}
