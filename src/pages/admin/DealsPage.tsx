// src/pages/admin/DealsPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Flame,
  Pencil,
  Plus,
  Power,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { FilterTabOption, FilterToolbar } from '../../components/ui/FilterToolbar';
import { DealFormModal, ProductOption } from '../../components/deals/DealFormModal';
import { useAdminSession } from '../../hooks/useAdminSession';
import apiClient, { extractApiErrorMessage } from '../../services/apiClient';
import {
  AdminDeal,
  AdminDealPayload,
  createAdminDeal,
  deleteAdminDeal,
  getAdminDeals,
  toggleAdminDeal,
  updateAdminDeal,
} from '../../services/dealAPI';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

type DealFilterTab = 'ALL' | 'ACTIVE' | 'FLASH_SALE' | 'EXPIRED' | 'INACTIVE';

const DEAL_TABS: Array<FilterTabOption<DealFilterTab>> = [
  { label: 'All Deals', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Flash Sale', value: 'FLASH_SALE' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export function DealsPage() {
  const { adminUser, signingOut, handleLogout } = useAdminSession();
  const [deals, setDeals] = useState<AdminDeal[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<DealFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<AdminDeal | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadProductsOptions = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data?: ProductOption[] | { items?: ProductOption[] } }>(
        '/admin/products',
        { params: { limit: 100 } }
      );
      const payload = res.data?.data;
      if (Array.isArray(payload)) {
        setProducts(payload);
      } else if (payload && Array.isArray(payload.items)) {
        setProducts(payload.items);
      }
    } catch {
      // Fallback aman agar daftar deals tetap dimuat jika daftar produk sedang kosong/error
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dealsList = await getAdminDeals({
        status: statusTab !== 'ALL' ? statusTab : undefined,
        search: searchQuery.trim() || undefined,
      });
      setDeals(dealsList);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusTab, searchQuery]);

  useEffect(() => {
    loadProductsOptions();
  }, [loadProductsOptions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  const stats = useMemo(() => {
    const now = Date.now();
    const activeCount = deals.filter(
      (d) => d.is_active && new Date(d.expires_at).getTime() > now
    ).length;
    const flashCount = deals.filter((d) => d.is_flash_sale && d.is_active).length;
    const totalClaimed = deals.reduce((acc, d) => acc + Number(d.quota_claimed || 0), 0);
    return { activeCount, flashCount, totalClaimed };
  }, [deals]);

  const handleOpenCreate = () => {
    setEditingDeal(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (deal: AdminDeal) => {
    setEditingDeal(deal);
    setModalOpen(true);
  };

  const handleSaveDeal = async (payload: AdminDealPayload, editingId?: string) => {
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await updateAdminDeal(editingId, payload);
      } else {
        await createAdminDeal(payload);
      }
      setModalOpen(false);
      setEditingDeal(null);
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (dealId: string) => {
    try {
      const updated = await toggleAdminDeal(dealId);
      setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, ...updated } : d)));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!window.confirm('Hapus promo deal ini dan kembalikan harga produk ke normal?')) return;
    try {
      await deleteAdminDeal(dealId);
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <AdminLayout
      title="Deals & Flash Sale Management"
      breadcrumbs={[
        { label: 'Admin', to: '/admin/dashboard' },
        { label: 'Deals & Flash Sale' },
      ]}
      adminUser={adminUser}
      signingOut={signingOut}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Top Action & KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900 text-white p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Active Deals
              </p>
              <p className="text-2xl font-black font-mono text-orange-400 mt-1">
                {stats.activeCount}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Tag className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Flash Sale Items
              </p>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                {stats.flashCount}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Total Quota Claimed
              </p>
              <p className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {stats.totalClaimed}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white p-5 flex items-center justify-center gap-2.5 font-extrabold text-sm transition shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Deal</span>
          </button>
        </div>

        {error && <AlertBanner variant="warning" message={error} onRetry={loadData} />}

        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search deal title, product name, or badge..."
          tabs={DEAL_TABS}
          activeTab={statusTab}
          onTabChange={setStatusTab}
          onRefresh={loadData}
          refreshing={loading}
        />

        {/* Deals Table */}
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-3">
              <p className="text-sm font-extrabold text-slate-900">
                Belum ada promo deal pada filter ini
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol <strong>Create New Deal</strong> untuk memasang harga promo flash sale yang otomatis tampil di halaman /deals Themavia Market.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-900 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                    <th className="py-3.5 px-6">Product & Deal</th>
                    <th className="py-3.5 px-4">Badge</th>
                    <th className="py-3.5 px-4">Pricing</th>
                    <th className="py-3.5 px-4">Quota</th>
                    <th className="py-3.5 px-4">Expires At</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {deals.map((deal) => {
                    const isExpired = new Date(deal.expires_at).getTime() <= Date.now();
                    const regularPrice = Number(deal.product?.regular_price || 0);

                    return (
                      <tr key={deal.id} className="hover:bg-orange-50/35 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="min-w-50">
                            <p className="text-xs font-extrabold text-slate-900">
                              {deal.deal_title || deal.product?.title || deal.product_id}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {deal.product?.title}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-600 text-white px-2.5 py-1 text-[10px] font-mono font-black uppercase">
                            -{deal.discount_percent}% • {deal.deal_badge}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                          <span className="text-xs font-black text-orange-600">
                            {formatCurrency(deal.deal_price)}
                          </span>
                          {regularPrice > 0 && (
                            <span className="ml-2 text-[11px] text-slate-400 line-through">
                              {formatCurrency(regularPrice)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-700">
                          {deal.quota_claimed} / {deal.quota_limit ?? '∞'}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {formatDateTime(deal.expires_at)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isExpired ? (
                            <span className="inline-flex rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-500">
                              EXPIRED
                            </span>
                          ) : deal.is_active ? (
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
                              title={deal.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                              onClick={() => handleToggle(deal.id)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition cursor-pointer"
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Edit Deal"
                              onClick={() => handleOpenEdit(deal)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-orange-500 hover:text-orange-600 transition cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Hapus Deal"
                              onClick={() => handleDelete(deal.id)}
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

      <DealFormModal
        isOpen={modalOpen}
        editingDeal={editingDeal}
        products={products}
        submitting={submitting}
        onClose={() => {
          setModalOpen(false);
          setEditingDeal(null);
        }}
        onSubmit={handleSaveDeal}
      />
    </AdminLayout>
  );
}