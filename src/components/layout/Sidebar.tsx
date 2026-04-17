'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/Logo';

// ── Nav items ─────────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/discovery',
    label: 'Discover Spaces',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: '/saved',
    label: 'Saved Spaces',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    href: '/bookings',
    label: 'My Bookings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── NavLinks (shared between desktop sidebar and mobile drawer) ───────────────

export function NavLinks({
  onNavigate,
}: {
  /** Called after a nav link is clicked — lets the drawer close itself. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul role="list" className="space-y-0.5">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg py-2.5 pr-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-l-[3px] border-indigo-600 bg-indigo-50 pl-[9px] text-indigo-700'
                  : 'border-l-[3px] border-transparent pl-[9px] text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className={`shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                {icon}
              </span>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { user, logout } = useAuth();
  const initials = user ? getInitials(user.name) : '?';

  return (
    <aside className="hidden lg:flex h-screen w-60 shrink-0 sticky top-0 flex-col border-r border-gray-200 bg-white overflow-y-auto">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <Logo />
        <span className="text-lg font-bold text-gray-900 tracking-tight">TeloHive</span>
      </Link>

      {/* Nav */}
      <nav aria-label="Main navigation" className="flex-1 px-3 py-4">
        <NavLinks />
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
              onClick={logout}
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
  );
}
