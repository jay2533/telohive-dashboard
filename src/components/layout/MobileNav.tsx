'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/Logo';
import { NavLinks, getInitials } from './Sidebar';

// ── Component ─────────────────────────────────────────────────────────────────

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const initials = user ? getInitials(user.name) : '?';

  return (
    <>
      {/* ── Fixed top bar ─────────────────────────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-drawer"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo + wordmark */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Logo />
          <span className="text-base font-bold text-gray-900 tracking-tight">TeloHive</span>
        </Link>
      </div>

      {/* ── Backdrop ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ── Slide-in drawer ───────────────────────────────────────────── */}
      <aside
        id="mobile-drawer"
        aria-label="Navigation menu"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <Logo />
            <span className="text-base font-bold text-gray-900 tracking-tight">TeloHive</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks onNavigate={() => setIsOpen(false)} />
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1">
                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsOpen(false); logout(); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-1">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-32 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
