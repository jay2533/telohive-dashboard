import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SavedClient } from './SavedClient';

export const metadata: Metadata = {
  title: 'Saved Spaces — Telohive',
  description: 'Your saved workspace favourites.',
};

function SavedFallback() {
  return (
    <div className="px-4 sm:px-8 py-8">
      <div className="mb-6">
        <div className="h-8 w-40 rounded-lg bg-gray-200 animate-pulse mb-2" />
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="flex gap-3 mb-6">
        <div className="h-9 flex-1 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-9 w-36 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-9 w-36 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[380px] rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function SavedPage() {
  return (
    <Suspense fallback={<SavedFallback />}>
      <SavedClient />
    </Suspense>
  );
}
