// src/components/coupons/CouponFormModal.tsx
import React, { useEffect, useState } from 'react';
import { Save, Shuffle, TicketPercent, X } from 'lucide-react';
import type {
  AdminCoupon,
  AdminCouponPayload,
  CouponDiscountType,
} from '../../services/couponAPI';

interface CouponFormModalProps {
  isOpen: boolean;
  editingCoupon: AdminCoupon | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminCouponPayload, editingId?: string) => Promise<void>;
}

function toLocalDateTimeInput(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function generateRandomCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TMV-${suffix}`;
}

export function CouponFormModal({
  isOpen,
  editingCoupon,
  submitting,
  onClose,
  onSubmit,
}: CouponFormModalProps) {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<CouponDiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('15');
  const [minPurchase, setMinPurchase] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('100');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLocalError(null);

    if (editingCoupon) {
      setCode(editingCoupon.code);
      setDescription(editingCoupon.description || '');
      setDiscountType(editingCoupon.discount_type);
      setDiscountValue(String(editingCoupon.discount_value));
      setMinPurchase(String(editingCoupon.min_purchase || 0));
      setMaxDiscount(
        editingCoupon.max_discount !== null ? String(editingCoupon.max_discount) : ''
      );
      setUsageLimit(
        editingCoupon.usage_limit !== null ? String(editingCoupon.usage_limit) : ''
      );
      setExpiresAt(toLocalDateTimeInput(editingCoupon.expires_at));
      setIsActive(Boolean(editingCoupon.is_active));
    } else {
      setCode('');
      setDescription('');
      setDiscountType('PERCENTAGE');
      setDiscountValue('15');
      setMinPurchase('0');
      setMaxDiscount('25');
      setUsageLimit('100');
      setExpiresAt('');
      setIsActive(true);
    }
  }, [isOpen, editingCoupon]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
    if (cleanCode.length < 3) {
      setLocalError('Kode kupon wajib minimal 3 karakter.');
      return;
    }

    const numericValue = Number(discountValue);
    if (isNaN(numericValue) || numericValue <= 0) {
      setLocalError('Nilai potongan diskon harus lebih besar dari 0.');
      return;
    }
    if (discountType === 'PERCENTAGE' && numericValue > 100) {
      setLocalError('Diskon persentase maksimal 100%.');
      return;
    }

    await onSubmit(
      {
        code: cleanCode,
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: numericValue,
        min_purchase: Math.max(0, Number(minPurchase || 0)),
        max_discount:
          discountType === 'PERCENTAGE' && maxDiscount.trim() !== ''
            ? Number(maxDiscount)
            : null,
        usage_limit: usageLimit.trim() !== '' ? Number(usageLimit) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: isActive,
      },
      editingCoupon?.id
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white">
              <TicketPercent className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-black">
                {editingCoupon ? 'Edit Promo Coupon' : 'Create Promo Coupon'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Kode voucher checkout keranjang Themavia Market
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {localError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-700">
              {localError}
            </div>
          )}

          {/* Kode Voucher */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Coupon Code *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CONTOH: LAUNCH20"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono font-black uppercase tracking-wider text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCode(generateRandomCouponCode())}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-500 transition cursor-pointer"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>Generate</span>
              </button>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Promo khusus pembeli pertama atau bundle template..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Tipe & Nilai Diskon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as CouponDiscountType)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Discount Value ({discountType === 'PERCENTAGE' ? '%' : '$'}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono font-black text-orange-600 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Min Purchase, Max Discount, Usage Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Min. Purchase ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Max Discount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                disabled={discountType === 'FIXED'}
                value={discountType === 'FIXED' ? '' : maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder={discountType === 'FIXED' ? 'N/A' : 'No cap'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Usage Limit
              </label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Expires At & Active Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Expires At (Opsional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <label className="inline-flex items-center gap-2.5 text-xs font-bold text-slate-800 pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-emerald-600 rounded"
              />
              <span>Aktifkan kode kupon sekarang</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 text-xs font-extrabold transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Save Coupon'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}