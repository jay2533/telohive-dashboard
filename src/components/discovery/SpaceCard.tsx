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
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? '#ef4444' : 'none'}
      stroke={filled ? '#ef4444' : 'currentColor'}
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
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 bg-gray-200 rounded w-3/5" />
          <div className="h-5 bg-gray-200 rounded-full w-12" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-2/5" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="flex gap-1.5">
          <div className="h-6 bg-gray-200 rounded-full w-14" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-12" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────

export function SpaceCard(props: SpaceCardProps) {
  if (props.isLoading) return <SpaceCardSkeleton />;

  const { space, isSaved, onToggleSave } = props;
  const visibleAmenities = space.amenities.slice(0, 3);
  const extraCount = space.amenities.length - 3;

  return (
    <article className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-violet-300 hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Cover image */}
      <div className="relative h-48 bg-gray-100 shrink-0">
        {space.images[0] ? (
          <Image
            src={space.images[0]}
            alt={space.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-gray-700 border border-white/60 shadow-sm">
            {space.category}
          </span>
        </div>

        {/* Save / heart button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSave();
          }}
          aria-label={isSaved ? 'Remove from saved' : 'Save this space'}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-white/60 shadow-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <HeartIcon filled={isSaved} />
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4">
        {/* Name + capacity badge */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
            {space.name}
          </h3>
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-medium">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-label="Capacity"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            {space.capacity}
          </span>
        </div>

        {/* City */}
        <p className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {space.city}
        </p>

        {/* Stars + review count */}
        <div className="flex items-center gap-1.5 mb-3">
          <StarDisplay rating={space.rating} />
          <span className="text-xs text-gray-500">
            {space.rating.toFixed(1)}
            <span className="text-gray-400"> ({space.reviewCount})</span>
          </span>
        </div>

        {/* Amenity tags */}
        {space.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {visibleAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700"
              >
                {amenity}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                +{extraCount} more
              </span>
            )}
          </div>
        )}

        {/* Footer: price + CTA */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100">
          <div className="leading-none">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(space.pricePerHour)}
            </span>
            <span className="text-xs text-gray-400"> /day</span>
          </div>
          <button
            type="button"
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}
