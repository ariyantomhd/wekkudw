import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { AdminDashboardStats } from '../../types/dashboard';
import { formatCurrency } from '../../utils/formatters';

export interface DashboardStatsStripProps {
  stats: AdminDashboardStats;
  loading: boolean;
}

export function DashboardStatsStrip({ stats, loading }: DashboardStatsStripProps) {
  return (
    <section
      aria-label="Key Performance Metrics"
      className="rounded-2xl border border-slate-200 bg-white grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200"
    >
      <div className="p-6">
        <p className="text-xs font-medium text-slate-500">Total Products</p>
        {loading ? (
          <div className="mt-3 h-8 w-24 rounded-lg bg-slate-100 animate-pulse" />
        ) : (
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {stats.total_products.toLocaleString()}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Published & draft catalog items</span>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-0.5 font-medium text-[#583cf0] hover:underline whitespace-nowrap"
          >
            Catalog <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="p-6">
        <p className="text-xs font-medium text-slate-500">Total Revenue</p>
        {loading ? (
          <div className="mt-3 h-8 w-36 rounded-lg bg-slate-100 animate-pulse" />
        ) : (
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(stats.total_revenue)}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Gross settled marketplace sales</span>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-0.5 font-medium text-[#583cf0] hover:underline whitespace-nowrap"
          >
            Orders <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="p-6">
        <p className="text-xs font-medium text-slate-500">Active Orders</p>
        {loading ? (
          <div className="mt-3 h-8 w-20 rounded-lg bg-slate-100 animate-pulse" />
        ) : (
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {stats.active_orders.toLocaleString()}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Paid & pending transactions</span>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-0.5 font-medium text-[#583cf0] hover:underline whitespace-nowrap"
          >
            Monitor <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
