import { Link } from 'react-router-dom';
import type { Order } from '../../types/order';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OrderStatusLabel } from '../ui/StatusLabel';

export interface RecentOrdersTableProps {
  orders: Order[];
  loading: boolean;
}

export function RecentOrdersTable({ orders, loading }: RecentOrdersTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest marketplace orders synced from Express & Supabase.
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="text-xs font-semibold text-[#583cf0] hover:underline whitespace-nowrap shrink-0"
        >
          View All Orders
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="px-6 py-3.5 flex items-center justify-between gap-4">
              <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-40 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">No recent orders recorded</p>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Incoming buyer transactions from Themavia Market will appear here once connected to tmv-admin-be.
          </p>
          <div className="mt-4">
            <Link
              to="/admin/products/create"
              className="inline-flex items-center rounded-xl bg-[#583cf0] px-4 py-2 text-xs font-semibold text-white hover:bg-[#492de0] transition-colors"
            >
              Upload First Product
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Invoice</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-6 text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-6 font-mono text-xs font-medium text-slate-900 tabular-nums whitespace-nowrap">
                    {order.invoice_number}
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {order.buyer?.email || order.buyer_email || order.buyer_id}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                    {order.payment_gateway}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <OrderStatusLabel status={order.payment_status} />
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="py-3 px-6 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {formatCurrency(order.grand_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
