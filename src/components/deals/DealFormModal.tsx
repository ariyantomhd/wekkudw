// src/components/deals/DealFormModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Flame, Percent, Save, X } from 'lucide-react';
import type { AdminDeal, AdminDealPayload } from '../../services/dealAPI';

export interface ProductOption {
  id: string;
  title: string;
  regular_price: number;
  category_id?: string | null;
}

interface DealFormModalProps {
  isOpen: boolean;
  editingDeal: AdminDeal | null;
  products: ProductOption[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminDealPayload, editingId?: string) => Promise<void>;
}

function toLocalDateTimeInput(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  if (isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function DealFormModal({
  isOpen,
  editingDeal,
  products,
  submitting,
  onClose,
  onSubmit,
}: DealFormModalProps) {
  const [productId, setProductId] = useState('');
  const [dealTitle, setDealTitle] = useState('');
  const [dealBadge, setDealBadge] = useState('FLASH SALE');
  const [dealPrice, setDealPrice] = useState<string>('19');
  const [isFlashSale, setIsFlashSale] = useState(true);
  const [quotaLimit, setQuotaLimit] = useState<string>('50');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLocalError(null);

    if (editingDeal) {
      setProductId(editingDeal.product_id);
      setDealTitle(editingDeal.deal_title || editingDeal.product?.title || '');
      setDealBadge(editingDeal.deal_badge || 'FLASH SALE');
      setDealPrice(String(editingDeal.deal_price));
      setIsFlashSale(Boolean(editingDeal.is_flash_sale));
      setQuotaLimit(editingDeal.quota_limit !== null ? String(editingDeal.quota_limit) : '');
      setStartsAt(toLocalDateTimeInput(editingDeal.starts_at));
      setExpiresAt(toLocalDateTimeInput(editingDeal.expires_at));
      setIsActive(Boolean(editingDeal.is_active));
    } else {
      const defaultProduct = products[0];
      setProductId(defaultProduct?.id || '');
      setDealTitle(defaultProduct?.title || '');
      setDealBadge('FLASH SALE');
      setDealPrice(
        defaultProduct ? String(Math.max(1, Math.round(defaultProduct.regular_price * 0.6))) : '19'
      );
      setIsFlashSale(true);
      setQuotaLimit('50');
      setStartsAt(toLocalDateTimeInput(new Date().toISOString()));
      setExpiresAt(toLocalDateTimeInput(new Date(Date.now() + 7 * 86400000).toISOString()));
      setIsActive(true);
    }
  }, [isOpen, editingDeal, products]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) || editingDeal?.product || null,
    [products, productId, editingDeal]
  );

  const regularPrice = Number(selectedProduct?.regular_price || 0);
  const numericDealPrice = Number(dealPrice || 0);
  const discountPreview =
    regularPrice > 0 && numericDealPrice > 0 && numericDealPrice < regularPrice
      ? Math.round(((regularPrice - numericDealPrice) / regularPrice) * 100)
      : 0;

  if (!isOpen) return null;

  const handleProductSelect = (nextProductId: string) => {
    setProductId(nextProductId);
    const found = products.find((p) => p.id === nextProductId);
    if (found) {
      setDealTitle(found.title);
      setDealPrice(String(Math.max(1, Math.round(found.regular_price * 0.6))));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!productId) {
      setLocalError('Pilih produk katalog terlebih dahulu.');
      return;
    }
    if (!expiresAt) {
      setLocalError('Tanggal berakhir promo wajib diisi.');
      return;
    }
    if (regularPrice > 0 && numericDealPrice >= regularPrice) {
      setLocalError(`Harga deal harus lebih kecil dari harga normal ($${regularPrice}).`);
      return;
    }

    await onSubmit(
      {
        product_id: productId,
        deal_title: dealTitle.trim() || selectedProduct?.title || null,
        deal_badge: dealBadge.trim().toUpperCase() || 'FLASH SALE',
        deal_price: numericDealPrice,
        is_flash_sale: isFlashSale,
        quota_limit: quotaLimit.trim() === '' ? null : Number(quotaLimit),
        starts_at: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
        expires_at: new Date(expiresAt).toISOString(),
        is_active: isActive,
      },
      editingDeal?.id
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
              <Flame className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-black">
                {editingDeal ? 'Edit Promo Deal' : 'Create New Promo Deal'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Otomatis sinkron ke halaman /deals Themavia Market
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

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {localError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-700">
              {localError}
            </div>
          )}

          {/* Produk Katalog */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Target Produk Katalog
            </label>
            <select
              value={productId}
              disabled={Boolean(editingDeal)}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none disabled:opacity-60"
            >
              <option value="">-- Pilih Produk --</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.title} (Normal: ${prod.regular_price})
                </option>
              ))}
            </select>
          </div>

          {/* Judul & Badge Promo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Deal Title
              </label>
              <input
                type="text"
                value={dealTitle}
                onChange={(e) => setDealTitle(e.target.value)}
                placeholder="Nama tampilan promo..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Promo Badge
              </label>
              <input
                type="text"
                value={dealBadge}
                onChange={(e) => setDealBadge(e.target.value)}
                placeholder="FLASH SALE / HOT DEAL"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-mono font-bold uppercase text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Harga Deal & Kalkulator Diskon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div>
              <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                Regular Price
              </span>
              <p className="text-base font-black font-mono text-slate-700 mt-1">
                ${regularPrice.toFixed(2)}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Deal Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={dealPrice}
                onChange={(e) => setDealPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-mono font-black text-orange-600 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end">
              <span className="inline-flex items-center gap-1 rounded-xl bg-rose-600 text-white px-3 py-2 text-xs font-mono font-black">
                <Percent className="h-3.5 w-3.5" />
                <span>-{discountPreview}% OFF</span>
              </span>
            </div>
          </div>

          {/* Kuota & Tanggal Mulai / Berakhir */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Quota Limit
              </label>
              <input
                type="number"
                min="1"
                value={quotaLimit}
                onChange={(e) => setQuotaLimit(e.target.value)}
                placeholder="Unlimited"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Starts At
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Expires At *
              </label>
              <input
                type="datetime-local"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isFlashSale}
                onChange={(e) => setIsFlashSale(e.target.checked)}
                className="h-4 w-4 accent-orange-500 rounded"
              />
              <span>Tandai sebagai Flash Sale</span>
            </label>

            <label className="inline-flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-emerald-600 rounded"
              />
              <span>Status Aktif</span>
            </label>
          </div>

          {/* Submit Footer */}
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
              <span>{submitting ? 'Saving...' : editingDeal ? 'Update Deal' : 'Publish Deal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}