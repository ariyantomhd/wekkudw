import { Eye } from 'lucide-react';
import type { Order } from '../../types/order';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { OrderStatusLabel } from '../ui/StatusLabel';

export interface OrdersTableProps {
  orders: Order[];
  totalCount: number;
  loading: boolean;
  onInspect: (order: Order) => void;
}

export function OrdersTable({
  orders,
  totalCount,
  loading,
  onInspect,
}: OrdersTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {loading ? (
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-48 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="text-sm font-semibold text-slate-900">
            {totalCount === 0
              ? 'No incoming transactions yet'
              : 'No orders match the current filter'}
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            {totalCount === 0
              ? 'Orders placed on Themavia Market will be listed here with payment gateway status and buyer details.'
              : 'Try clearing your search input or selecting All statuses.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Invoice</th>
                <th className="py-3 px-4">Buyer Details</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.map((order) => {
                const buyerName = order.buyer?.username || order.buyer_name || 'Buyer';
                const buyerEmail = order.buyer?.email || order.buyer_email || order.buyer_id;

                return (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-6 font-mono text-xs font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {order.invoice_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="min-w-[180px]">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {buyerName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{buyerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {order.payment_gateway}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <OrderStatusLabel status={order.payment_status} uppercase />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatCurrency(order.grand_total)}
                    </td>
                    <td className="py-3 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onInspect(order)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-[#583cf0]/40 hover:text-[#583cf0] transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
