// src/components/reviews/ReviewFormModal.tsx
import React, { useEffect, useState } from 'react';
import { Save, Sparkles, Star, X } from 'lucide-react';
import type { AdminProductReview, InjectReviewPayload } from '../../services/reviewAPI';

export interface ProductSelectItem {
  id: string;
  title: string;
}

interface ReviewFormModalProps {
  isOpen: boolean;
  products: ProductSelectItem[];
  editingReview: AdminProductReview | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: InjectReviewPayload, editingId?: string) => Promise<void>;
}

const SAMPLE_PERSONAS = [
  { name: 'Marcus Vance', role: 'Full-Stack Engineer · US' },
  { name: 'Elena Rostova', role: 'SaaS Founder · DE' },
  { name: 'Kenji Takahashi', role: 'Web3 Developer · JP' },
  { name: 'Daniel Mercer', role: 'Indie Maker · UK' },
  { name: 'Sofia Lindqvist', role: 'Frontend Lead · SE' },
  { name: 'Raka Pratama', role: 'Agency Tech Lead · ID' },
];

function toLocalDateTimeInput(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function ReviewFormModal({
  isOpen,
  products,
  editingReview,
  submitting,
  onClose,
  onSubmit,
}: ReviewFormModalProps) {
  const [productId, setProductId] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [isApproved, setIsApproved] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLocalError(null);

    if (editingReview) {
      setProductId(editingReview.product_id);
      setReviewerName(editingReview.reviewer_name);
      setReviewerRole(editingReview.reviewer_role || '');
      setRating(editingReview.rating || 5);
      setTitle(editingReview.title || '');
      setComment(editingReview.comment);
      setCreatedAt(toLocalDateTimeInput(editingReview.created_at));
      setIsVerified(Boolean(editingReview.is_verified_purchase));
      setIsApproved(Boolean(editingReview.is_approved));
    } else {
      setProductId(products[0]?.id || '');
      setReviewerName('');
      setReviewerRole('');
      setRating(5);
      setTitle('');
      setComment('');
      setCreatedAt(toLocalDateTimeInput(new Date().toISOString()));
      setIsVerified(true);
      setIsApproved(true);
    }
  }, [isOpen, editingReview, products]);

  if (!isOpen) return null;

  const handleGeneratePersona = () => {
    const pick = SAMPLE_PERSONAS[Math.floor(Math.random() * SAMPLE_PERSONAS.length)];
    setReviewerName(pick.name);
    setReviewerRole(pick.role);
    // Mundurkan tanggal acak 1-14 hari ke belakang agar tampak natural
    const randomDaysAgo = Math.floor(Math.random() * 14) + 1;
    const pastDate = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
    setCreatedAt(toLocalDateTimeInput(pastDate.toISOString()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!productId) {
      setLocalError('Pilih produk terlebih dahulu.');
      return;
    }
    if (reviewerName.trim().length < 2) {
      setLocalError('Nama reviewer minimal 2 karakter.');
      return;
    }
    if (comment.trim().length < 5) {
      setLocalError('Komentar ulasan minimal 5 karakter.');
      return;
    }

    await onSubmit(
      {
        product_id: productId,
        reviewer_name: reviewerName.trim(),
        reviewer_role: reviewerRole.trim() || null,
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
        is_verified_purchase: isVerified,
        is_approved: isApproved,
        created_at: createdAt ? new Date(createdAt).toISOString() : undefined,
      },
      editingReview?.id
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
              <Star className="h-4 w-4 fill-current" />
            </span>
            <div>
              <h2 className="text-sm font-black">
                {editingReview ? 'Edit Product Review' : 'Inject Marketing Review'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Rating produk di storefront otomatis dihitung ulang
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

          {/* Pilih Produk */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Target Product *
            </label>
            <select
              required
              disabled={Boolean(editingReview)}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none disabled:opacity-60"
            >
              <option value="">-- Pilih Produk Digital --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Reviewer & Persona */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Reviewer Name *
                </label>
                {!editingReview && (
                  <button
                    type="button"
                    onClick={handleGeneratePersona}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Auto Persona</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Contoh: Marcus Vance"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Role / Location Label
              </label>
              <input
                type="text"
                value={reviewerRole}
                onChange={(e) => setReviewerRole(e.target.value)}
                placeholder="Full-Stack Dev · US"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Star Rating Picker & Custom Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Star Rating *
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`rounded-xl p-2 border transition cursor-pointer ${
                      star <= rating
                        ? 'bg-orange-50 border-orange-300 text-orange-500'
                        : 'bg-slate-50 border-slate-200 text-slate-300'
                    }`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                ))}
                <span className="ml-2 font-mono text-xs font-black text-slate-700">
                  {rating}.0 / 5.0
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Review Timestamp (Backdate)
              </label>
              <input
                type="datetime-local"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Headline Title */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Review Headline (Opsional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Clean architecture, saved me 2 weeks of setup!"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Review Comment */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Review Comment *
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis testimoni yang spesifik dan meyakinkan tentang kualitas source code, dokumentasi, dan kemudahan instalasi..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="h-4 w-4 accent-orange-500 rounded"
              />
              <span>Tampilkan badge "Verified Buyer"</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isApproved}
                onChange={(e) => setIsApproved(e.target.checked)}
                className="h-4 w-4 accent-emerald-600 rounded"
              />
              <span>Publish langsung ke storefront</span>
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
              <span>{submitting ? 'Saving...' : editingReview ? 'Update Review' : 'Inject Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}