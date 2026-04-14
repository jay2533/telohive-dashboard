'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useSpaces } from '@/hooks/useSpaces';
import { useSaved } from '@/hooks/useSaved';

// ── Booking type (matches db.json) ────────────────────────────────────────────

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
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
    >
      {status}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  loading?: boolean;
}

function StatCard({ label, value, icon, trend, trendUp, loading }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
          {icon}
        </div>
      </div>
      {loading ? (
        <>
          <div className="h-8 w-24 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
        </>
      ) : (
        <>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p
            className={`text-xs font-medium flex items-center gap-1 ${
              trendUp ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
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
            >
              {trendUp ? (
                <polyline points="18 15 12 9 6 15" />
              ) : (
                <polyline points="6 9 12 15 18 9" />
              )}
            </svg>
            {trend}
          </p>
        </>
      )}
    </div>
  );
}

// ── Custom chart tooltip ──────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-violet-700 font-semibold">{payload[0].value} bookings</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardClient() {
  const { spaces, loading: spacesLoading } = useSpaces();
  const { savedItems, loading: savedLoading } = useSaved();

  const [bookings, setBookings] = useState<RawBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const res = await fetch(BOOKINGS_URL);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setBookings((await res.json()) as RawBooking[]);
    } catch (err) {
      setBookingsError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchBookings(); }, [fetchBookings]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status === 'Confirmed').length,
    [bookings],
  );
  const totalSpent = useMemo(
    () => bookings.reduce((sum, b) => sum + b.amount, 0),
    [bookings],
  );

  // ── Last-6-months chart data ──────────────────────────────────────────────
  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short' });
      const count = bookings.filter((b) => b.date.startsWith(key)).length;
      return { month: label, bookings: count };
    });
  }, [bookings]);

  // ── Upcoming bookings (date >= today, next 5) ─────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [bookings, today],
  );

  const statsLoading = spacesLoading || savedLoading || bookingsLoading;

  return (
    <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto space-y-8">
      {/* ── Page heading ───────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Your workspace activity at a glance
        </p>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Spaces"
          value={spaces.length}
          trend="+5% from last month"
          trendUp
          loading={statsLoading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />
        <StatCard
          label="Saved Spaces"
          value={savedItems.length}
          trend="+2 this week"
          trendUp
          loading={statsLoading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          }
        />
        <StatCard
          label="Active Bookings"
          value={activeBookings}
          trend="+12% from last month"
          trendUp
          loading={statsLoading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(totalSpent)}
          trend="-3% from last month"
          trendUp={false}
          loading={statsLoading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
      </div>

      {/* ── Chart + upcoming (two columns on wide screens) ─────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Booking Activity</h2>
          <p className="text-xs text-gray-500 mb-6">Bookings per month (last 6 months)</p>
          {bookingsLoading ? (
            <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
          ) : bookingsError ? (
            <div className="h-64 flex items-center justify-center text-sm text-red-500">
              Failed to load chart data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  width={28}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f5f3ff' }} />
                <Bar dataKey="bookings" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Upcoming bookings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Upcoming Bookings</h2>
          <p className="text-xs text-gray-500 mb-4">Next 5 upcoming</p>

          {bookingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
              <p className="text-sm text-gray-500">No upcoming bookings</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcomingBookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.spaceName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(booking.date)} · {booking.type}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
