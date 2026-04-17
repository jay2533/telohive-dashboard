'use client';

import type { SortOption } from '@/types';

// ── Option definitions ────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest',       label: 'Newest'              },
  { value: 'price_asc',   label: 'Price: Low → High'   },
  { value: 'price_desc',  label: 'Price: High → Low'   },
  { value: 'rating_desc', label: 'Highest Rated'        },
  { value: 'capacity_asc',  label: 'Capacity: Small → Large' },
  { value: 'capacity_desc', label: 'Capacity: Large → Small' },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface SortDropdownProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const current = SORT_OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="sort-select" className="sr-only">
        Sort spaces by
      </label>
      <div className="pointer-events-none absolute right-2.5 text-gray-400">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer transition-colors"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Visible label for screen readers showing current selection */}
      <span className="sr-only">Currently sorting by: {current?.label}</span>
    </div>
  );
}
