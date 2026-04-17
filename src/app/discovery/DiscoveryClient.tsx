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

  const searchValue = filters.kind === 'active' ? filters.searchQuery : '';

  // ── Error state ───────────────────────────────────────────────────────────
  if (spacesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 mb-1">Failed to load spaces</p>
          <p className="text-sm text-gray-500">{spacesError}</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Filter panel */}
      <FilterPanel
        allSpaces={spaces}
        filters={filters}
        setFilter={setFilter}
        clearAllFilters={clearAllFilters}
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setFilterPanelOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors shrink-0"
            aria-label="Open filters"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Search — flex-1, full-width within bar */}
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search spaces by name, city…"
              value={searchValue}
              onChange={(e) => setFilter('searchQuery', e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white min-h-[48px] pl-13 pr-12 text-base shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setFilter('searchQuery', '')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
              >
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="1" y1="1" x2="9" y2="9" />
                  <line x1="9" y1="1" x2="1" y2="9" />
                </svg>
              </button>
            )}
          </div>

          {/* Result count + sort */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {spacesLoading ? (
                <span className="inline-block h-4 w-32 rounded-full bg-gray-200 animate-pulse" />
              ) : (
                <>
                  <span className="font-semibold text-gray-900">{sortedSpaces.length}</span>
                  <span className="text-gray-400"> of {spaces.length} spaces</span>
                </>
              )}
            </span>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="px-6 py-6">
          {/* Active filter chips */}
          <ActiveFilterChips
            filters={filters}
            setFilter={setFilter}
            clearAllFilters={clearAllFilters}
          />

          {/* Grid / empty / loading */}
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
        </div>
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
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900 mb-1.5">No spaces found</p>
        <p className="text-sm text-gray-500 max-w-xs">
          {hasFilters
            ? 'Try adjusting your filters.'
            : 'No spaces available right now.'}
        </p>
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
