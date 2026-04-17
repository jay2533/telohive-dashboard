import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DiscoveryClient } from './DiscoveryClient';

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Discover Spaces — TeloHive',
  description:
    'Browse and filter coworking spaces, private offices, meeting rooms, and more.',
};

// ── Loading fallback (shown while DiscoveryClient suspends on useSearchParams) ─

function DiscoveryFallback() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-gray-200" />
      {/* Content skeleton */}
      <div className="flex-1 px-4 sm:px-6 py-6 space-y-4">
        <div className="flex gap-3">
          <div className="h-9 w-24 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-9 flex-1 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-9 w-32 rounded-lg bg-gray-200 animate-pulse" />
        </div>
        <div
          style={{
            display: 'grid',
            gap: 24,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[380px] rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DiscoveryPage() {
  return (
    <Suspense fallback={<DiscoveryFallback />}>
      <DiscoveryClient />
    </Suspense>
  );
}
