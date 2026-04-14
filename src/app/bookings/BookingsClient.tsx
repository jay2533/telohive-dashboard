'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawBooking {
  id: string;
  spaceId: number;
  spaceName: string;
  city: string;
  date: string;       // YYYY-MM-DD
  type: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  amount: number;
  createdAt: string;
}

type SortKey = 'spaceName' | 'date' | 'type' | 'status' | 'amount';
type SortDir = 'asc' | 'desc';

const STATUSES = ['Pending', 'Confirmed', 'Cancelled'] as const;
const BOOKINGS_URL = 'http://localhost:3001/bookings';

// ── Formatters ────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending:   'bg-amber-50  text-amber-700  border-amber-200',
    Cancelled: 'bg-red-50    text-red-600    border-red-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${styles[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
    >
      {status}
    </span>
  );
}

// ── Sort indicator ────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`ml-1 shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-30'}`}
    >
      {active && dir === 'asc' ? (
        <polyline points="18 15 12 9 6 15" />
      ) : (
        <polyline points="6 9 12 15 18 9" />
      )}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BookingsClient() {
  const [bookings, setBookings] = useState<RawBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ── Sort ──────────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // ── Selection ─────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Bulk action state ─────────────────────────────────────────────────────
  const [isCancelling, setIsCancelling] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(BOOKINGS_URL);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setBookings((await res.json()) as RawBooking[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchBookings(); }, [fetchBookings]);

  // ── Status chip toggle ────────────────────────────────────────────────────
  function toggleStatus(status: string) {
    setSelectedIds(new Set()); // clear selection when filters change
    setStatusFilter((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  }

  // ── Filtered + sorted rows ────────────────────────────────────────────────
  const visibleBookings = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = bookings.filter((b) => {
      if (q && !b.spaceName.toLowerCase().includes(q)) return false;
      if (statusFilter.size > 0 && !statusFilter.has(b.status)) return false;
      if (dateFrom && b.date < dateFrom) return false;
      if (dateTo && b.date > dateTo) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'spaceName': cmp = a.spaceName.localeCompare(b.spaceName); break;
        case 'date':      cmp = a.date.localeCompare(b.date); break;
        case 'type':      cmp = a.type.localeCompare(b.type); break;
        case 'status':    cmp = a.status.localeCompare(b.status); break;
        case 'amount':    cmp = a.amount - b.amount; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [bookings, searchQuery, statusFilter, dateFrom, dateTo, sortKey, sortDir]);

  // ── Column header click ───────────────────────────────────────────────────
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  // ── Selection helpers ─────────────────────────────────────────────────────
  const visibleIds = useMemo(
    () => new Set(visibleBookings.map((b) => b.id)),
    [visibleBookings],
  );
  const allVisibleSelected =
    visibleIds.size > 0 && [...visibleIds].every((id) => selectedIds.has(id));

  function toggleSelectAll() {
    if (allVisibleSelected) {
      // Deselect all visible
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      // Select all visible
      setSelectedIds((prev) => new Set([...prev, ...visibleIds]));
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Bulk cancel ───────────────────────────────────────────────────────────
  async function handleBulkCancel() {
    const ids = [...selectedIds];
    setIsCancelling(true);
    const updated: RawBooking[] = [];
    for (const id of ids) {
      try {
        const res = await fetch(`${BOOKINGS_URL}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Cancelled' }),
        });
        if (res.ok) {
          updated.push((await res.json()) as RawBooking);
        }
      } catch {
        // continue with remaining ids
      }
    }
    setBookings((prev) =>
      prev.map((b) => {
        const upd = updated.find((u) => u.id === b.id);
        return upd ?? b;
      }),
    );
    setSelectedIds(new Set());
    setIsCancelling(false);
  }

  // ── Individual cancel ─────────────────────────────────────────────────────
  async function handleCancelOne(id: string) {
    try {
      const res = await fetch(`${BOOKINGS_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' }),
      });
      if (!res.ok) return;
      const updated = (await res.json()) as RawBooking;
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    } catch {
      // silently fail — UI stays unchanged
    }
  }

  // ── CSV export ────────────────────────────────────────────────────────────
  function handleExportCsv() {
    const rows = visibleBookings.filter((b) => selectedIds.has(b.id));
    const header = 'Space Name,Date,Type,Status,Amount';
    const lines = rows.map((b) =>
      [
        `"${b.spaceName.replace(/"/g, '""')}"`,
        b.date,
        b.type,
        b.status,
        b.amount,
      ].join(','),
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter.size > 0 ||
    dateFrom !== '' ||
    dateTo !== '';

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">Failed to load bookings</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => void fetchBookings()}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-8">
      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage all your workspace bookings
        </p>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="space-y-3 mb-4">
        {/* Row 1: search + date range */}
        <div className="flex flex-wrap gap-3">
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
              placeholder="Search by space name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="date-from" className="text-sm text-gray-500 whitespace-nowrap">
              From
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="date-to" className="text-sm text-gray-500 whitespace-nowrap">
              To
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
            />
          </div>
        </div>

        {/* Row 2: status chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          {STATUSES.map((s) => {
            const active = statusFilter.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleStatus(s)}
                aria-pressed={active}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-violet-400 hover:text-violet-600'
                }`}
              >
                {s}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter(new Set());
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors ml-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk actions bar ──────────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-violet-50 border border-violet-200 px-4 py-3 mb-4">
          <span className="text-sm font-medium text-violet-800">
            {selectedIds.size} of {visibleBookings.length} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => void handleBulkCancel()}
              disabled={isCancelling}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isCancelling ? 'Cancelling…' : 'Cancel selected'}
            </button>
          </div>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                {/* Select-all checkbox */}
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    disabled={visibleBookings.length === 0}
                    className="h-4 w-4 rounded border-gray-300 accent-violet-600 cursor-pointer"
                    aria-label="Select all visible rows"
                  />
                </th>
                {(
                  [
                    { key: 'spaceName', label: 'Space Name' },
                    { key: 'date',      label: 'Date'        },
                    { key: 'type',      label: 'Type'        },
                    { key: 'status',    label: 'Status'      },
                    { key: 'amount',    label: 'Amount'      },
                  ] as { key: SortKey; label: string }[]
                ).map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap cursor-pointer select-none hover:text-violet-700 transition-colors"
                    onClick={() => handleSort(key)}
                  >
                    <span className="inline-flex items-center">
                      {label}
                      <SortIcon active={sortKey === key} dir={sortDir} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: j === 0 ? 16 : `${60 + (j * 13) % 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visibleBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="text-sm text-gray-500 mb-3">No bookings match your filters.</p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter(new Set());
                          setDateFrom('');
                          setDateTo('');
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                visibleBookings.map((booking) => {
                  const selected = selectedIds.has(booking.id);
                  const isCancelled = booking.status === 'Cancelled';
                  return (
                    <tr
                      key={booking.id}
                      className={`border-b border-gray-100 last:border-0 transition-colors ${
                        selected ? 'bg-violet-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRow(booking.id)}
                          className="h-4 w-4 rounded border-gray-300 accent-violet-600 cursor-pointer"
                          aria-label={`Select booking for ${booking.spaceName}`}
                        />
                      </td>
                      {/* Space name */}
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {booking.spaceName}
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(booking.date)}
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {booking.type}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      {/* Amount */}
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {formatCurrency(booking.amount)}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={isCancelled}
                          onClick={() => void handleCancelOne(booking.id)}
                          className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer: row count */}
        {!loading && visibleBookings.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Showing{' '}
              <span className="font-medium text-gray-700">{visibleBookings.length}</span>
              {' '}of{' '}
              <span className="font-medium text-gray-700">{bookings.length}</span>
              {' '}bookings
            </span>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-violet-600 hover:text-violet-800 font-medium"
              >
                Clear selection
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
