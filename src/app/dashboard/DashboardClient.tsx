'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSpaces } from '@/hooks/useSpaces';
import { useSaved } from '@/hooks/useSaved';

// ── Booking type (matches db.json) ────────────────────────────────────────────

interface RawBooking {
  id: string;
  spaceId: number;
  spaceName: string;
  city: string;
  date: string;
  type: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  amount: number;
  createdAt: string;
}

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
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${styles[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
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
  cardClassName: string;
  iconBg: string;
  iconText: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, trend, trendUp, cardClassName, iconBg, iconText, loading }: StatCardProps) {
  return (
    <div className={`${cardClassName} shadow-sm`}>
      <div className="flex flex-col">
        <span className="text-xs font-medium tracking-wide text-gray-400 uppercase">
          {label}
        </span>
        {loading ? (
          <>
            <div className="h-10 w-28 rounded-lg bg-gray-200 animate-pulse my-2" />
            <div className="h-4 w-36 rounded bg-gray-200 animate-pulse" />
          </>
        ) : (
          <>
            <p className="text-3xl font-bold text-gray-900 my-2">{value}</p>
            <p className={`text-sm flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {trendUp ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
              </svg>
              {trend}
            </p>
          </>
        )}
      </div>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconText}`}>
        {icon}
      </div>
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
    <div className="rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-lg text-sm">
      <p className="font-medium text-gray-600 mb-0.5">{label}</p>
      <p className="text-indigo-600 font-bold">{payload[0].value} bookings</p>
    </div>
  );
}

// ── Upcoming booking row ──────────────────────────────────────────────────────

const STATUS_BORDER: Record<string, string> = {
  Confirmed: 'border-l-[3px] border-emerald-500',
  Pending:   'border-l-[3px] border-amber-400',
  Cancelled: 'border-l-[3px] border-gray-300',
};

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

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status === 'Confirmed').length,
    [bookings],
  );
  const totalSpent = useMemo(
    () => bookings.reduce((sum, b) => sum + b.amount, 0),
    [bookings],
  );

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
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's been happening</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Spaces"
          value={spaces.length}
          trend="+5% from last month"
          trendUp
          cardClassName="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 p-6 flex items-start justify-between"
          iconBg="bg-blue-50"
          iconText="text-blue-500"
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
          cardClassName="bg-white rounded-xl border border-gray-200 border-l-4 border-l-rose-500 p-6 flex items-start justify-between"
          iconBg="bg-rose-50"
          iconText="text-rose-500"
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
          cardClassName="bg-white rounded-xl border border-gray-200 border-l-4 border-l-amber-500 p-6 flex items-start justify-between"
          iconBg="bg-amber-50"
          iconText="text-amber-500"
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
          cardClassName="bg-white rounded-xl border border-gray-200 border-l-4 border-l-emerald-500 p-6 flex items-start justify-between"
          iconBg="bg-emerald-50"
          iconText="text-emerald-500"
          loading={statsLoading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
      </div>

      {/* Chart + upcoming */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="xl:col-span-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Booking Activity</h2>
          <p className="text-xs text-gray-500 mb-6">
            Bookings per month · last 6 months
          </p>
          {bookingsLoading ? (
            <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
          ) : bookingsError ? (
            <div className="h-64 flex items-center justify-center text-sm text-red-400">
              Failed to load chart data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barSize={40} barCategoryGap="30%">
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  width={24}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f5f3ff', radius: 6 }} />
                <Bar dataKey="bookings" fill="#6366f1" radius={[6, 6, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Upcoming bookings */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Upcoming Bookings</h2>
          <p className="text-xs text-gray-500 mb-5">
            Next 5 upcoming
          </p>

          {bookingsLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[60px] rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
              <p className="text-sm text-gray-400">No upcoming bookings</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {upcomingBookings.map((booking) => (
                <li
                  key={booking.id}
                  className={`flex items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-3 ${STATUS_BORDER[booking.status] ?? ''}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                      {booking.spaceName}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
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
