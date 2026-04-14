'use client';

import { useState } from 'react';
import { useSpaces } from '@/hooks/useSpaces';
import { useFilters } from '@/hooks/useFilters';
import { useSaved } from '@/hooks/useSaved';
import { FilterPanel } from '@/components/discovery/FilterPanel';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
import { SortDropdown } from '@/components/discovery/SortDropdown';
import { VirtualizedGrid } from '@/components/discovery/VirtualizedGrid';

// ── Component ─────────────────────────────────────────────────────────────────

export function DiscoveryClient() {
  const { spaces, loading: spacesLoading, error: spacesError, refetch } = useSpaces();
  const {
    filters,
    sortBy,
    setSortBy,
    setFilter,
    clearAllFilters,
    activeFilterCount,
    sortedSpaces,
  } = useFilters(spaces);
  const { isSaved, toggleSave } = useSaved();

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // ── Error state ───────────────────────────────────────────────────────────
  if (spacesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">Failed to load spaces</p>
          <p className="text-sm text-gray-500">{spacesError}</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Filter panel (desktop sidebar + mobile drawer) ──────────────── */}
      <FilterPanel
        allSpaces={spaces}
        filters={filters}
        setFilter={setFilter}
        clearAllFilters={clearAllFilters}
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
      />

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-6">
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setFilterPanelOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Open filters"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search spaces…"
              value={filters.kind === 'active' ? filters.searchQuery : ''}
              onChange={(e) => setFilter('searchQuery', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Result count + sort */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {spacesLoading ? (
                <span className="inline-block h-4 w-32 rounded bg-gray-200 animate-pulse" />
              ) : (
                <>
                  <span className="font-semibold text-gray-800">{sortedSpaces.length}</span>
                  {' of '}
                  <span className="font-semibold text-gray-800">{spaces.length}</span>
                  {' spaces'}
                </>
              )}
            </span>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* ── Active filter chips ─────────────────────────────────────── */}
        <ActiveFilterChips
          filters={filters}
          setFilter={setFilter}
          clearAllFilters={clearAllFilters}
        />

        {/* ── Grid / empty / loading ──────────────────────────────────── */}
        {!spacesLoading && sortedSpaces.length === 0 ? (
          <EmptyState hasFilters={activeFilterCount > 0} onClear={clearAllFilters} />
        ) : (
          <VirtualizedGrid
            spaces={sortedSpaces}
            isLoading={spacesLoading}
            skeletonCount={8}
            isSaved={isSaved}
            onToggleSave={(id) => void toggleSave(id)}
          />
        )}
      </main>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-gray-900 mb-1">No spaces found</p>
        <p className="text-sm text-gray-500">
          {hasFilters
            ? 'Try adjusting your filters to see more results.'
            : 'No spaces are available at the moment.'}
        </p>
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
