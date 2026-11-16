import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { OrderStatus } from '../../types/enums';
import type { OrderDetailData } from '../../types/order';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export interface OrderDetailDrawerProps {
  order: OrderDetailData | null;
  loadingDetail?: boolean;
  updatingStatus: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, nextStatus: OrderStatus) => void;
}

export function OrderDetailDrawer({
  order,
  loadingDetail = false,
  updatingStatus,
  onClose,
  onStatusChange,
}: OrderDetailDrawerProps) {
  useEffect(() => {
    if (!order) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 id="order-detail-title" className="text-base font-semibold text-slate-900">
              Order {order.invoice_number}
            </h2>
            <p className="text-xs text-slate-500 tabular-nums">
              {formatDateTime(order.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4 text-sm">
            <h3 className="text-xs font-semibold text-slate-500">Buyer Information</h3>
            <p className="font-medium text-slate-900">
              {order.buyer?.username || order.buyer_name || 'Buyer Account'}
            </p>
            <p className="text-xs text-slate-600">
              {order.buyer?.email || order.buyer_email || order.buyer_id}
            </p>
            {order.paypal_transaction_id && (
              <p className="text-xs font-mono text-slate-500">
                Gateway Ref: {order.paypal_transaction_id}
              </p>
            )}
            {order.affiliate_token_used && (
              <p className="text-xs font-mono text-slate-500">
                Affiliate Ref: {order.affiliate_token_used}
              </p>
            )}
          </div>

          <div className="space-y-3 border-b border-slate-100 pb-4">
            <h3 className="text-xs font-semibold text-slate-500">Order Items</h3>
            {loadingDetail ? (
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-36 rounded bg-slate-100 animate-pulse" />
              </div>
            ) : order.order_items && order.order_items.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {order.order_items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {item.product?.title || item.product_title || item.product_id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.license_type} License
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums shrink-0">
                      {formatCurrency(item.price_at_purchase)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No line items attached to this order payload.</p>
            )}
          </div>

          {order.licenses && order.licenses.length > 0 && (
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <h3 className="text-xs font-semibold text-slate-500">Issued Licenses</h3>
              <div className="divide-y divide-slate-100">
                {order.licenses.map((lic) => (
                  <div key={lic.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-slate-900 truncate">{lic.license_key}</span>
                    <span className="text-slate-500 shrink-0">
                      {lic.license_type} · {lic.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-xs text-slate-600 border-b border-slate-100 pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="font-mono tabular-nums">-{formatCurrency(order.discount_total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Buyer & Gateway Fees</span>
              <span className="font-mono tabular-nums">
                {formatCurrency((order.buyer_fee || 0) + (order.gateway_fee || 0))}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-semibold text-slate-900">
              <span>Grand Total</span>
              <span className="font-mono tabular-nums">{formatCurrency(order.grand_total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="order-status-select" className="block text-xs font-semibold text-slate-500">
              Update Payment Status
            </label>
            <select
              id="order-status-select"
              disabled={updatingStatus}
              value={order.payment_status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#583cf0] focus:outline-none focus:ring-2 focus:ring-[#583cf0]/15"
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
