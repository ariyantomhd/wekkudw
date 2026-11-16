// src/pages/admin/ReviewsPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Eye,
  EyeOff,
  Megaphone,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { FilterTabOption, FilterToolbar } from '../../components/ui/FilterToolbar';
import {
  ProductSelectItem,
  ReviewFormModal,
} from '../../components/reviews/ReviewFormModal';
import { useAdminSession } from '../../hooks/useAdminSession';
import apiClient, { extractApiErrorMessage } from '../../services/apiClient';
import {
  AdminProductReview,
  deleteAdminReview,
  getAdminReviews,
  injectAdminReview,
  InjectReviewPayload,
  toggleAdminReview,
  updateAdminReview,
} from '../../services/reviewAPI';
import { formatDateTime } from '../../utils/formatters';

type ReviewSourceTab = 'ALL' | 'INJECTED' | 'ORGANIC';

const SOURCE_TABS: Array<FilterTabOption<ReviewSourceTab>> = [
  { label: 'All Reviews', value: 'ALL' },
  { label: 'Admin Injected', value: 'INJECTED' },
  { label: 'Organic Buyers', value: 'ORGANIC' },
];

export function ReviewsPage() {
  const { adminUser, signingOut, handleLogout } = useAdminSession();
  const [reviews, setReviews] = useState<AdminProductReview[]>([]);
  const [products, setProducts] = useState<ProductSelectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceTab, setSourceTab] = useState<ReviewSourceTab>('ALL');
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<AdminProductReview | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadProductsOptions = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data?: ProductSelectItem[] }>('/admin/products');
      const rawProducts = Array.isArray(res.data?.data) ? res.data.data : [];
      setProducts(rawProducts.map((p) => ({ id: p.id, title: p.title })));
    } catch {
      // Fallback jika endpoint memakai /products
      try {
        const fallbackRes = await apiClient.get<{ data?: ProductSelectItem[] }>('/products');
        const rawFallback = Array.isArray(fallbackRes.data?.data) ? fallbackRes.data.data : [];
        setProducts(rawFallback.map((p) => ({ id: p.id, title: p.title })));
      } catch {
        // Biarkan dropdown produk kosong tanpa memblokir tabel review
      }
    }
  }, []);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reviewList = await getAdminReviews({
        source: sourceTab !== 'ALL' ? sourceTab : undefined,
        product_id: productFilter !== 'ALL' ? productFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setReviews(reviewList);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [sourceTab, productFilter, searchQuery]);

  useEffect(() => {
    loadProductsOptions();
  }, [loadProductsOptions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReviews();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadReviews]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const injectedCount = reviews.filter((r) => r.is_admin_injected).length;
    const avgRating =
      total > 0
        ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / total).toFixed(2)
        : '0.00';
    return {
      total,
      injectedCount,
      avgRating,
    };
  }, [reviews]);

  const handleSaveReview = async (payload: InjectReviewPayload, editingId?: string) => {
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await updateAdminReview(editingId, payload);
      } else {
        await injectAdminReview(payload);
      }
      setModalOpen(false);
      setEditingReview(null);
      await loadReviews();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (reviewId: string) => {
    try {
      const updated = await toggleAdminReview(reviewId);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleDelete = async (review: AdminProductReview) => {
    if (!window.confirm(`Hapus ulasan dari "${review.reviewer_name}"?`)) return;
    try {
      await deleteAdminReview(review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <AdminLayout
      title="Product Reviews & Rating Injection"
      breadcrumbs={[
        { label: 'Admin', to: '/admin/dashboard' },
        { label: 'Reviews' },
      ]}
      adminUser={adminUser}
      signingOut={signingOut}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* KPI Summary & Inject Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900 text-white p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Average Rating
              </p>
              <p className="text-2xl font-black font-mono text-orange-400 mt-1">
                {stats.avgRating} ★
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Star className="h-5 w-5 fill-current" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Total Reviews
              </p>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                {stats.total}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Admin Injected
              </p>
              <p className="text-2xl font-black font-mono text-orange-600 mt-1">
                {stats.injectedCount}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Megaphone className="h-5 w-5" />
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingReview(null);
              setModalOpen(true);
            }}
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white p-5 flex items-center justify-center gap-2.5 font-extrabold text-sm transition shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Inject Marketing Review</span>
          </button>
        </div>

        {error && <AlertBanner variant="warning" message={error} onRetry={loadReviews} />}

        {/* Filter Toolbar + Product Filter */}
        <div className="space-y-3">
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search reviewer name, role, headline, or comment..."
            tabs={SOURCE_TABS}
            activeTab={sourceTab}
            onTabChange={setSourceTab}
            onRefresh={loadReviews}
            refreshing={loading}
          />

          <div className="flex flex-wrap items-center gap-2 px-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Filter Product:
            </span>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-orange-500 focus:outline-none"
            >
              <option value="ALL">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reviews Table */}
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-2">
              <p className="text-sm font-extrabold text-slate-900">
                Belum ada ulasan produk ditemukan
              </p>
              <p className="text-xs text-slate-500">
                Klik "Inject Marketing Review" untuk menambahkan ulasan awal pada produk baru.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-900 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                    <th className="py-3.5 px-6">Reviewer</th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Rating & Review</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-orange-50/35 transition-colors">
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            {rev.reviewer_name}
                          </span>
                          {rev.is_verified_purchase && (
                            <span title="Verified Buyer Badge">
                              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                            </span>
                          )}
                        </div>
                        {rev.reviewer_role && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{rev.reviewer_role}</p>
                        )}
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {formatDateTime(rev.created_at)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-xs font-bold text-slate-800 truncate max-w-47.5">
                          {rev.product?.title || rev.product_id}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-0.5 text-orange-500 mb-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`h-3.5 w-3.5 ${
                                idx < rev.rating ? 'fill-current' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        {rev.title && (
                          <p className="text-xs font-extrabold text-slate-900">{rev.title}</p>
                        )}
                        <p className="text-xs text-slate-600 line-clamp-2 max-w-75">
                          {rev.review_text || rev.comment}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {rev.is_admin_injected ? (
                          <span className="inline-flex rounded-lg bg-orange-50 border border-orange-200 px-2.5 py-1 text-[10px] font-mono font-black text-orange-700">
                            INJECTED
                          </span>
                        ) : (
                          <span className="inline-flex rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-700">
                            ORGANIC
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {rev.is_approved ? (
                          <span className="inline-flex rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-700">
                            VISIBLE
                          </span>
                        ) : (
                          <span className="inline-flex rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-500">
                            HIDDEN
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            title={rev.is_approved ? 'Sembunyikan' : 'Tampilkan'}
                            onClick={() => handleToggle(rev.id)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition cursor-pointer"
                          >
                            {rev.is_approved ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            title="Edit Review"
                            onClick={() => {
                              setEditingReview(rev);
                              setModalOpen(true);
                            }}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-orange-500 hover:text-orange-600 transition cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Hapus Review"
                            onClick={() => handleDelete(rev)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-rose-500 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ReviewFormModal
        isOpen={modalOpen}
        products={products}
        editingReview={editingReview}
        submitting={submitting}
        onClose={() => {
          setModalOpen(false);
          setEditingReview(null);
        }}
        onSubmit={handleSaveReview}
      />
    </AdminLayout>
  );
}