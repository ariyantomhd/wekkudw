// src/pages/admin/CouponsPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clock,
  Copy,
  Pencil,
  Plus,
  Power,
  TicketPercent,
  Trash2,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { FilterTabOption, FilterToolbar } from '../../components/ui/FilterToolbar';
import { CouponFormModal } from '../../components/coupons/CouponFormModal';
import { useAdminSession } from '../../hooks/useAdminSession';
import { extractApiErrorMessage } from '../../services/apiClient';
import {
  AdminCoupon,
  AdminCouponPayload,
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupons,
  toggleAdminCoupon,
  updateAdminCoupon,
} from '../../services/couponAPI';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

type CouponFilterTab = 'ALL' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE';

const COUPON_TABS: Array<FilterTabOption<CouponFilterTab>> = [
  { label: 'All Coupons', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export function CouponsPage() {
  const { adminUser, signingOut, handleLogout } = useAdminSession();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<CouponFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAdminCoupons({
        status: statusTab !== 'ALL' ? statusTab : undefined,
        search: searchQuery.trim() || undefined,
      });
      setCoupons(list);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCoupons();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadCoupons]);

  const stats = useMemo(() => {
    const now = Date.now();
    const activeCount = coupons.filter(
      (c) => c.is_active && (!c.expires_at || new Date(c.expires_at).getTime() > now)
    ).length;
    const totalRedemptions = coupons.reduce((acc, c) => acc + Number(c.used_count || 0), 0);
    return {
      totalCoupons: coupons.length,
      activeCount,
      totalRedemptions,
    };
  }, [coupons]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleSaveCoupon = async (payload: AdminCouponPayload, editingId?: string) => {
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await updateAdminCoupon(editingId, payload);
      } else {
        await createAdminCoupon(payload);
      }
      setModalOpen(false);
      setEditingCoupon(null);
      await loadCoupons();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (couponId: string) => {
    try {
      const updated = await toggleAdminCoupon(couponId);
      setCoupons((prev) => prev.map((c) => (c.id === couponId ? updated : c)));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleDelete = async (coupon: AdminCoupon) => {
    if (!window.confirm(`Hapus permanen kode kupon "${coupon.code}"?`)) return;
    try {
      await deleteAdminCoupon(coupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <AdminLayout
      title="Promo Coupons Management"
      breadcrumbs={[
        { label: 'Admin', to: '/admin/dashboard' },
        { label: 'Coupons' },
      ]}
      adminUser={adminUser}
      signingOut={signingOut}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* KPI Summary & Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900 text-white p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Active Coupons
              </p>
              <p className="text-2xl font-black font-mono text-orange-400 mt-1">
                {stats.activeCount}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <TicketPercent className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Total Codes
              </p>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                {stats.totalCoupons}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Total Redemptions
              </p>
              <p className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {stats.totalRedemptions}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingCoupon(null);
              setModalOpen(true);
            }}
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white p-5 flex items-center justify-center gap-2.5 font-extrabold text-sm transition shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Create Coupon</span>
          </button>
        </div>

        {error && <AlertBanner variant="warning" message={error} onRetry={loadCoupons} />}

        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search coupon code or description..."
          tabs={COUPON_TABS}
          activeTab={statusTab}
          onTabChange={setStatusTab}
          onRefresh={loadCoupons}
          refreshing={loading}
        />

        {/* Coupons Table */}
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-2">
              <p className="text-sm font-extrabold text-slate-900">
                Belum ada kode kupon ditemukan
              </p>
              <p className="text-xs text-slate-500">
                Buat kode voucher diskon baru agar pembeli bisa memakainya saat checkout.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-900 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                    <th className="py-3.5 px-6">Coupon Code</th>
                    <th className="py-3.5 px-4">Discount</th>
                    <th className="py-3.5 px-4">Min / Max Rule</th>
                    <th className="py-3.5 px-4">Redemptions</th>
                    <th className="py-3.5 px-4">Expiry</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {coupons.map((coupon) => {
                    const isExpired =
                      coupon.expires_at && new Date(coupon.expires_at).getTime() <= Date.now();

                    return (
                      <tr key={coupon.id} className="hover:bg-orange-50/35 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-slate-900 text-orange-400 px-2.5 py-1 font-mono text-xs font-black tracking-wider">
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(coupon.code)}
                              title="Copy code"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          {coupon.description && (
                            <p className="text-[11px] text-slate-500 mt-1 truncate max-w-60">
                              {coupon.description}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs font-black text-orange-600">
                          {coupon.discount_type === 'PERCENTAGE'
                            ? `${coupon.discount_value}% OFF`
                            : `${formatCurrency(coupon.discount_value)} OFF`}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-600">
                          <div>Min: {formatCurrency(coupon.min_purchase)}</div>
                          {coupon.max_discount !== null && (
                            <div className="text-[11px] text-slate-400">
                              Cap: {formatCurrency(coupon.max_discount)}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs font-bold text-slate-800">
                          {coupon.used_count} / {coupon.usage_limit ?? '∞'}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-600">
                          {coupon.expires_at ? (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {formatDateTime(coupon.expires_at)}
                            </span>
                          ) : (
                            <span className="text-slate-400">No expiry</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isExpired ? (
                            <span className="inline-flex rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-500">
                              EXPIRED
                            </span>
                          ) : coupon.is_active ? (
                            <span className="inline-flex rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-700">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-700">
                              PAUSED
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              title={coupon.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                              onClick={() => handleToggle(coupon.id)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition cursor-pointer"
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Edit Kupon"
                              onClick={() => {
                                setEditingCoupon(coupon);
                                setModalOpen(true);
                              }}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-orange-500 hover:text-orange-600 transition cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Hapus Kupon"
                              onClick={() => handleDelete(coupon)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-rose-500 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <CouponFormModal
        isOpen={modalOpen}
        editingCoupon={editingCoupon}
        submitting={submitting}
        onClose={() => {
          setModalOpen(false);
          setEditingCoupon(null);
        }}
        onSubmit={handleSaveCoupon}
      />
    </AdminLayout>
  );
}