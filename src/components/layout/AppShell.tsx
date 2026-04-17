'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

// ── Paths that render without the nav shell ───────────────────────────────────

const NO_SHELL_PREFIXES = ['/', '/login', '/register'];

function useShowShell(): boolean {
  const pathname = usePathname();
  // Exact match for '/' (root redirect page); prefix match for auth routes
  if (pathname === '/') return false;
  return !NO_SHELL_PREFIXES.slice(1).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const showShell = useShowShell();

  if (!showShell) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar — sticky, full viewport height */}
      <Sidebar />

      {/* Content column: mobile top bar + page content */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* Mobile top bar (fixed, 56 px tall) */}
        <MobileNav />

        {/* Spacer pushes content below the fixed mobile bar */}
        <div className="h-14 shrink-0 lg:hidden" aria-hidden="true" />

        {/* Page content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
