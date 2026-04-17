import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingsClient } from './BookingsClient';

export const metadata: Metadata = {
  title: 'Bookings — TeloHive',
  description: 'Manage your workspace bookings.',
};

function BookingsFallback() {
  return (
    <div className="px-4 sm:px-8 py-8">
      <div className="mb-6">
        <div className="h-8 w-32 rounded-lg bg-gray-200 animate-pulse mb-2" />
        <div className="h-4 w-56 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-9 flex-1 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-9 w-36 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-9 w-36 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
            <div className="h-4 w-4 rounded bg-gray-200 animate-pulse shrink-0" />
            <div className="h-4 flex-1 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<BookingsFallback />}>
      <BookingsClient />
    </Suspense>
  );
}
