'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, getSession, saveSession } from '@/lib/auth';
import type { User } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RegisterFields {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Simulates a network round-trip for the mock auth layer. */
const mockDelay = () => new Promise<void>((r) => setTimeout(r, 400));

function userFromEmail(email: string): User {
  return {
    id: `u-${Date.now()}`,
    email,
    name: email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    avatarUrl: null,
    role: 'guest',
    createdAt: new Date().toISOString(),
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });
  const router = useRouter();

  // Hydrate from localStorage on first render
  useEffect(() => {
    const session = getSession();
    setState({ user: session?.user ?? null, isLoading: false, error: null });
  }, []);

  /**
   * Signs in with email + password (mock: any credentials accepted).
   * Pass `rememberMe = true` to persist the session for 7 days.
   */
  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      void password; // unused in mock but kept for API parity
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        await mockDelay();
        const user = userFromEmail(email);
        saveSession(user, rememberMe);
        setState({ user, isLoading: false, error: null });
        router.push('/discovery');
      } catch {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Sign-in failed. Please try again.',
        }));
      }
    },
    [router],
  );

  /** Creates a new account and immediately signs the user in. */
  const register = useCallback(
    async (fields: RegisterFields) => {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        await mockDelay();
        const user: User = {
          id: `u-${Date.now()}`,
          email: fields.email,
          name: fields.name.trim(),
          avatarUrl: null,
          role: 'guest',
          createdAt: new Date().toISOString(),
        };
        saveSession(user, true);
        setState({ user, isLoading: false, error: null });
        router.push('/discovery');
      } catch {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Registration failed. Please try again.',
        }));
      }
    },
    [router],
  );

  /** Clears the session and navigates to /login. */
  const logout = useCallback(() => {
    clearSession();
    setState({ user: null, isLoading: false, error: null });
    router.push('/login');
  }, [router]);

  return { ...state, login, register, logout };
}
