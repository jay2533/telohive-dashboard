import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard — Telohive',
  description: 'Your workspace activity overview.',
};

function DashboardFallback() {
  return (
    <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto space-y-8">
      <div>
        <div className="h-8 w-36 rounded-lg bg-gray-200 animate-pulse mb-2" />
        <div className="h-4 w-56 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-80 rounded-2xl bg-gray-200 animate-pulse" />
        <div className="h-80 rounded-2xl bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardClient />
    </Suspense>
  );
}
