'use client';

import Image from 'next/image';
import type { Space } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type SpaceCardProps =
  | { isLoading: true }
  | {
      isLoading?: false;
      space: Space;
      isSaved: boolean;
      onToggleSave: () => void;
    };

// ── Formatters ────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ── Star display ──────────────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={i <= rounded ? '#f59e0b' : 'none'}
          stroke={i <= rounded ? '#f59e0b' : '#d1d5db'}
          strokeWidth="2"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ── Heart icon ────────────────────────────────────────────────────────────────

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SpaceCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm animate-pulse">
      <div className="h-[200px] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-2/5" />
        <div className="h-4 bg-gray-200 rounded w-28" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-5 bg-gray-200 rounded-full w-14" />
          <div className="h-5 bg-gray-200 rounded-full w-20" />
        </div>
        <div className="h-9 bg-gray-200 rounded-lg mt-2" />
      </div>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────

export function SpaceCard(props: SpaceCardProps) {
  if (props.isLoading) return <SpaceCardSkeleton />;

  const { space, isSaved, onToggleSave } = props;

  return (
    <article className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
      {/* ── Cover image ─────────────────────────────────────────────────── */}
      <div className="relative h-[200px] bg-gray-100 shrink-0 overflow-hidden">
        {space.images[0] ? (
          <Image
            src={space.images[0]}
            alt={space.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Category badge — top-left, dark semi-transparent pill */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white tracking-wide">
            {space.category}
          </span>
        </div>

        {/* Top-right stack: heart button + price pill */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(); }}
            aria-label={isSaved ? 'Remove from saved' : 'Save this space'}
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors ${
              isSaved
                ? 'bg-red-50 text-red-500'
                : 'bg-transparent text-white hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <HeartIcon filled={isSaved} />
          </button>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-white shadow-sm px-2.5 py-1 text-xs font-bold text-gray-900 whitespace-nowrap">
            {formatPrice(space.pricePerHour)}
            <span className="font-normal text-gray-400">/day</span>
          </span>
        </div>
      </div>

      {/* ── Card body ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Name */}
        <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
          {space.name}
        </h3>

        {/* City */}
        <p className="flex items-center gap-1 text-xs text-gray-400">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {space.city}
        </p>

        {/* Stars + review count */}
        <div className="flex items-center gap-1.5">
          <StarDisplay rating={space.rating} />
          <span className="text-xs font-medium text-gray-600">{space.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({space.reviewCount})</span>
        </div>

        {/* Capacity + top amenity tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Capacity">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            {space.capacity}
          </span>
          {space.amenities[0] && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {space.amenities[0]}
            </span>
          )}
          {space.amenities.length > 1 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              +{space.amenities.length - 1}
            </span>
          )}
        </div>

        {/* View Details — full-width CTA */}
        <button
          type="button"
          className="mt-3 w-full rounded-lg bg-gray-900 py-2 text-sm font-semibold text-white hover:bg-gray-700 active:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
        >
          View Details
        </button>
      </div>
    </article>
  );
}
