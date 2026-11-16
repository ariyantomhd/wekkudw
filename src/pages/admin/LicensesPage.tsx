// src/pages/admin/LicensesPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  KeyRound,
  RotateCcw,
  ShieldAlert,
  X,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { FilterTabOption, FilterToolbar } from '../../components/ui/FilterToolbar';
import { useAdminSession } from '../../hooks/useAdminSession';
import { extractApiErrorMessage } from '../../services/apiClient';
import {
  AdminLicense,
  getAdminLicenses,
  LicenseStatusType,
  resetAdminLicenseDomains,
  updateAdminLicenseStatus,
} from '../../services/licenseAPI';
import { formatDateTime } from '../../utils/formatters';

type LicenseFilterTab = 'ALL' | 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'SUSPENDED';

const LICENSE_TABS: Array<FilterTabOption<LicenseFilterTab>> = [
  { label: 'All Licenses', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Revoked', value: 'REVOKED' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Expired', value: 'EXPIRED' },
];

export function LicensesPage() {
  const { adminUser, signingOut, handleLogout } = useAdminSession();
  const [licenses, setLicenses] = useState<AdminLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<LicenseFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadLicenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAdminLicenses({
        status: statusTab !== 'ALL' ? statusTab : undefined,
        search: searchQuery.trim() || undefined,
      });
      setLicenses(list);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLicenses();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadLicenses]);

  const stats = useMemo(() => {
    const activeCount = licenses.filter((l) => l.status === 'ACTIVE').length;
    const revokedCount = licenses.filter((l) => l.status === 'REVOKED').length;
    const totalActivations = licenses.reduce(
      (acc, l) => acc + Number(l.activation_count || l.activated_domains?.length || 0),
      0
    );
    return {
      total: licenses.length,
      activeCount,
      revokedCount,
      totalActivations,
    };
  }, [licenses]);

  const handleCopyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleChangeStatus = async (lic: AdminLicense, nextStatus: LicenseStatusType) => {
    if (
      nextStatus === 'REVOKED' &&
      !window.confirm(`Cabut (REVOKE) lisensi ${lic.license_key}? Pembeli tidak akan bisa memverifikasi kunci ini lagi.`)
    ) {
      return;
    }

    setBusyId(lic.id);
    setError(null);
    try {
      const updated = await updateAdminLicenseStatus(lic.id, nextStatus);
      setLicenses((prev) => prev.map((item) => (item.id === lic.id ? updated : item)));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleResetAllDomains = async (lic: AdminLicense) => {
    if (
      !window.confirm(
        `Reset semua domain teraktivasi untuk kunci ${lic.license_key}? Pembeli dapat mengaktifkan ulang di domain baru.`
      )
    ) {
      return;
    }

    setBusyId(lic.id);
    setError(null);
    try {
      const updated = await resetAdminLicenseDomains(lic.id);
      setLicenses((prev) => prev.map((item) => (item.id === lic.id ? updated : item)));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveDomain = async (lic: AdminLicense, domain: string) => {
    setBusyId(lic.id);
    setError(null);
    try {
      const updated = await resetAdminLicenseDomains(lic.id, domain);
      setLicenses((prev) => prev.map((item) => (item.id === lic.id ? updated : item)));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout
      title="License Keys & Domain Activations"
      breadcrumbs={[
        { label: 'Admin', to: '/admin/dashboard' },
        { label: 'Licenses' },
      ]}
      adminUser={adminUser}
      signingOut={signingOut}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900 text-white p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Active Licenses
              </p>
              <p className="text-2xl font-black font-mono text-orange-400 mt-1">
                {stats.activeCount}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Total Issued Keys
              </p>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                {stats.total}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Active Domains
              </p>
              <p className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {stats.totalActivations}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Revoked Keys
              </p>
              <p className="text-2xl font-black font-mono text-rose-600 mt-1">
                {stats.revokedCount}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
        </div>

        {error && <AlertBanner variant="warning" message={error} onRetry={loadLicenses} />}

        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search license key, domain, buyer email, invoice, or product..."
          tabs={LICENSE_TABS}
          activeTab={statusTab}
          onTabChange={setStatusTab}
          onRefresh={loadLicenses}
          refreshing={loading}
        />

        {/* Licenses Table */}
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : licenses.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-2">
              <p className="text-sm font-extrabold text-slate-900">
                Belum ada data lisensi pada filter ini
              </p>
              <p className="text-xs text-slate-500">
                Kunci lisensi otomatis terbit ketika transaksi pembeli berstatus PAID.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-900 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                    <th className="py-3.5 px-6">License Key & Tier</th>
                    <th className="py-3.5 px-4">Product & Invoice</th>
                    <th className="py-3.5 px-4">Buyer</th>
                    <th className="py-3.5 px-4">Activated Domains</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {licenses.map((lic) => {
                    const isBusy = busyId === lic.id;
                    const tierLabel = String(lic.license_type || 'REGULAR').toUpperCase();

                    return (
                      <tr key={lic.id} className="hover:bg-orange-50/35 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-slate-900 text-orange-400 px-2.5 py-1 font-mono text-xs font-black tracking-wider">
                              {lic.license_key}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyKey(lic.license_key)}
                              title="Copy license key"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                            >
                              {copiedKey === lic.license_key ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                            <span
                              className={`font-bold ${
                                tierLabel === 'EXTENDED' ? 'text-orange-600' : 'text-slate-600'
                              }`}
                            >
                              {tierLabel}
                            </span>
                            <span>•</span>
                            <span>{formatDateTime(lic.created_at)}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="min-w-45">
                            <p className="text-xs font-extrabold text-slate-900 truncate max-w-57.5">
                              {lic.product?.title || lic.product_id}
                            </p>
                            {lic.invoice_number && (
                              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                                {lic.invoice_number}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="min-w-37.5">
                            <p className="text-xs font-bold text-slate-800">
                              {lic.buyer?.username || 'Buyer'}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-47.5">
                              {lic.buyer?.email || lic.buyer_id}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {lic.activated_domains.length === 0 ? (
                            <span className="text-xs font-mono text-slate-400">
                              0 domains bound
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-w-60">
                              {lic.activated_domains.map((domain) => (
                                <span
                                  key={domain}
                                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[11px] text-slate-700"
                                >
                                  <span>{domain}</span>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => handleRemoveDomain(lic, domain)}
                                    title={`Lepas domain ${domain}`}
                                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {lic.status === 'ACTIVE' ? (
                            <span className="inline-flex rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-700">
                              ACTIVE
                            </span>
                          ) : lic.status === 'REVOKED' ? (
                            <span className="inline-flex rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-mono font-bold text-rose-700">
                              REVOKED
                            </span>
                          ) : (
                            <span className="inline-flex rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-700">
                              {lic.status}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {lic.activated_domains.length > 0 && (
                              <button
                                type="button"
                                disabled={isBusy}
                                title="Reset semua domain teraktivasi"
                                onClick={() => handleResetAllDomains(lic)}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-orange-500 hover:text-orange-600 transition cursor-pointer disabled:opacity-50"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Reset</span>
                              </button>
                            )}

                            {lic.status === 'ACTIVE' ? (
                              <button
                                type="button"
                                disabled={isBusy}
                                title="Revoke License"
                                onClick={() => handleChangeStatus(lic, 'REVOKED')}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer disabled:opacity-50"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                <span>Revoke</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                title="Re-Activate License"
                                onClick={() => handleChangeStatus(lic, 'ACTIVE')}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Activate</span>
                              </button>
                            )}
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
    </AdminLayout>
  );
}