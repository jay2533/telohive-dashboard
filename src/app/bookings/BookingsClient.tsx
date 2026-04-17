'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

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
// Local mock API served by json-server (`npm run server`). Override via NEXT_PUBLIC_API_URL.
const BOOKINGS_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/bookings`;

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
    Cancelled: 'bg-red-50    text-red-500    border-red-200',
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
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`ml-1 shrink-0 transition-opacity ${active ? 'opacity-100 text-indigo-500' : 'opacity-25'}`}
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
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 mb-1">Failed to load bookings</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => void fetchBookings()}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto pb-24">
      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your bookings</p>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="space-y-3 mb-5">
        {/* Row 1: search + date range */}
        <div className="flex flex-wrap gap-3">
          {/* Search — rounded-full */}
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              width="15"
              height="15"
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
              placeholder="Search by space name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>
          {/* Date range — single inline row */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="date-from" className="sr-only">From date</label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            />
            <span className="text-xs text-gray-400 select-none">to</span>
            <label htmlFor="date-to" className="sr-only">To date</label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            />
          </div>
        </div>

        {/* Row 2: status chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Status
          </span>
          {STATUSES.map((s) => {
            const active = statusFilter.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleStatus(s)}
                aria-pressed={active}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150 ${
                  active
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800'
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

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {/* Select-all checkbox */}
                <th className="w-10 px-4 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    disabled={visibleBookings.length === 0}
                    className="h-4 w-4 rounded border-gray-300 accent-indigo-600 cursor-pointer"
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
                    className="px-4 py-3.5 text-left whitespace-nowrap cursor-pointer select-none group"
                    onClick={() => handleSort(key)}
                  >
                    <span className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-widest transition-colors ${sortKey === key ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-700'}`}>
                      {label}
                      <SortIcon active={sortKey === key} dir={sortDir} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className={`border-b border-gray-100 last:border-0 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                    </td>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 rounded-md bg-gray-200 animate-pulse" style={{ width: `${55 + (j * 17) % 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visibleBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500">No bookings match your filters</p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter(new Set());
                            setDateFrom('');
                            setDateTo('');
                          }}
                          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                visibleBookings.map((booking, idx) => {
                  const selected = selectedIds.has(booking.id);
                  const isCancelled = booking.status === 'Cancelled';
                  const rowBg = selected
                    ? 'bg-indigo-50'
                    : idx % 2 === 1
                    ? 'bg-gray-50/60 hover:bg-indigo-50/30'
                    : 'bg-white hover:bg-gray-50/80';
                  return (
                    <tr
                      key={booking.id}
                      className={`border-b border-gray-100 last:border-0 transition-colors ${rowBg}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRow(booking.id)}
                          className="h-4 w-4 rounded border-gray-300 accent-indigo-600 cursor-pointer"
                          aria-label={`Select booking for ${booking.spaceName}`}
                        />
                      </td>
                      {/* Space name */}
                      <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                        {booking.spaceName}
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {formatDate(booking.date)}
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {booking.type}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={booking.status} />
                      </td>
                      {/* Amount */}
                      <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                        {formatCurrency(booking.amount)}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          disabled={isCancelled}
                          onClick={() => void handleCancelOne(booking.id)}
                          className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-400">
              Showing{' '}
              <span className="font-semibold text-gray-700">{visibleBookings.length}</span>
              {' '}of{' '}
              <span className="font-semibold text-gray-700">{bookings.length}</span>
              {' '}bookings
            </span>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition-colors"
              >
                Clear selection
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Bulk action bar (fixed bottom, slides up when rows selected) ─── */}
      <div
        aria-hidden={selectedIds.size === 0}
        className={`fixed bottom-0 inset-x-0 z-40 transition-transform duration-300 ease-in-out ${
          selectedIds.size > 0 ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-gray-900 px-6 py-4 flex flex-wrap items-center gap-4 shadow-2xl border-t border-white/10">
          <span className="text-sm font-semibold text-white">
            {selectedIds.size} selected
          </span>
          <span className="text-white/30 hidden sm:inline">·</span>
          <span className="text-xs text-white/50 hidden sm:inline">
            {visibleBookings.length} visible
          </span>
          <div className="flex gap-2.5 ml-auto">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-600 bg-gray-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-700 transition-colors"
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isCancelling ? 'Cancelling…' : 'Cancel selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
