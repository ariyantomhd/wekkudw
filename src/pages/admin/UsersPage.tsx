// src/pages/admin/UsersPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  Clock,
  Globe,
  Laptop,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Users,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { FilterTabOption, FilterToolbar } from '../../components/ui/FilterToolbar';
import { useAdminSession } from '../../hooks/useAdminSession';
import { extractApiErrorMessage } from '../../services/apiClient';
import {
  AdminUserRecord,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  UserAccountStatus,
  UserRoleType,
} from '../../services/userAPI';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

type UserFilterTab = 'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED';

const USER_TABS: Array<FilterTabOption<UserFilterTab>> = [
  { label: 'All Users', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending Verification', value: 'PENDING' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

export function UsersPage() {
  const { adminUser, signingOut, handleLogout } = useAdminSession();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<UserFilterTab>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [vpnOnly, setVpnOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAdminUsers({
        status: statusTab !== 'ALL' ? statusTab : undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        vpn_only: vpnOnly || undefined,
        search: searchQuery.trim() || undefined,
      });
      setUsers(list);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusTab, roleFilter, vpnOnly, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const stats = useMemo(() => {
    const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
    const pendingCount = users.filter((u) => u.status === 'PENDING').length;
    const vpnFlaggedCount = users.filter((u) => u.is_vpn_detected).length;
    return {
      total: users.length,
      activeCount,
      pendingCount,
      vpnFlaggedCount,
    };
  }, [users]);

  const handleRoleChange = async (user: AdminUserRecord, nextRole: UserRoleType) => {
    if (user.role === nextRole) return;
    setBusyId(user.id);
    setError(null);
    try {
      const updated = await updateAdminUserRole(user.id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = async (user: AdminUserRecord, nextStatus: UserAccountStatus) => {
    if (
      nextStatus === 'SUSPENDED' &&
      !window.confirm(`Suspend akun ${user.username} (${user.email})?`)
    ) {
      return;
    }

    setBusyId(user.id);
    setError(null);
    try {
      const updated = await updateAdminUserStatus(user.id, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout
      title="Users, Security & Device Telemetry"
      breadcrumbs={[
        { label: 'Admin', to: '/admin/dashboard' },
        { label: 'Users' },
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
                Total Accounts
              </p>
              <p className="text-2xl font-black font-mono text-orange-400 mt-1">
                {stats.total}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Verified Active
              </p>
              <p className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {stats.activeCount}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Pending Email
              </p>
              <p className="text-2xl font-black font-mono text-amber-600 mt-1">
                {stats.pendingCount}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                VPN / Proxy Flagged
              </p>
              <p className="text-2xl font-black font-mono text-rose-600 mt-1">
                {stats.vpnFlaggedCount}
              </p>
            </div>
            <span className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
        </div>

        {error && <AlertBanner variant="warning" message={error} onRetry={loadUsers} />}

        {/* Filter Toolbar + Role & VPN Filter */}
        <div className="space-y-3">
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search username, email, IP address, or device..."
            tabs={USER_TABS}
            activeTab={statusTab}
            onTabChange={setStatusTab}
            onRefresh={loadUsers}
            refreshing={loading}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Filter Role:
              </span>
              {(['ALL', 'BUYER', 'CREATOR', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition cursor-pointer ${
                    roleFilter === r
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:border-rose-300">
              <input
                type="checkbox"
                checked={vpnOnly}
                onChange={(e) => setVpnOnly(e.target.checked)}
                className="h-3.5 w-3.5 accent-rose-600 rounded"
              />
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
              <span>Hanya Tampilkan Pengguna VPN / Proxy</span>
            </label>
          </div>
        </div>

        {/* Users Table */}
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-2">
              <p className="text-sm font-extrabold text-slate-900">
                Tidak ada akun pengguna yang cocok
              </p>
              <p className="text-xs text-slate-500">
                Coba ubah filter status, role, atau kata kunci pencarian.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-900 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                    <th className="py-3.5 px-6">User Account</th>
                    <th className="py-3.5 px-4">IP & VPN Status</th>
                    <th className="py-3.5 px-4">Device & OS</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Spent & Keys</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {users.map((u) => {
                    const isBusy = busyId === u.id;
                    const initial = (u.username || u.email || 'U').charAt(0).toUpperCase();
                    const isMobileDevice = /Mobile|Android|iOS/i.test(u.last_device || '');

                    return (
                      <tr key={u.id} className="hover:bg-orange-50/35 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3 min-w-47.5">
                            <div className="h-9 w-9 rounded-xl bg-slate-900 text-orange-400 font-black text-xs flex items-center justify-center shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 truncate">
                                {u.username}
                                {u.creator_number ? (
                                  <span className="ml-1.5 font-mono text-[10px] text-orange-600">
                                    #{u.creator_number}
                                  </span>
                                ) : null}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* IP & VPN Detection */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                              <Globe className="h-3.5 w-3.5 text-slate-400" />
                              <span>{u.last_login_ip || 'Not recorded'}</span>
                              {u.last_country && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                  {u.last_country}
                                </span>
                              )}
                            </div>

                            {u.last_login_ip && (
                              <div>
                                {u.is_vpn_detected ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-600 text-white px-2 py-0.5 text-[10px] font-mono font-black">
                                    <ShieldAlert className="h-3 w-3" />
                                    VPN / PROXY
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-mono font-bold">
                                    CLEAN IP
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Device & Last Seen */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            {isMobileDevice ? (
                              <Smartphone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                            ) : (
                              <Laptop className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            )}
                            <span>{u.last_device || 'Unknown Device'}</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {u.last_seen_at
                              ? `Seen ${formatDateTime(u.last_seen_at)}`
                              : `Joined ${formatDateTime(u.created_at)}`}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            disabled={isBusy}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value as UserRoleType)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="BUYER">BUYER</option>
                            <option value="CREATOR">CREATOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                          <div className="font-extrabold text-slate-900">
                            {formatCurrency(u.total_spent || 0)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {u.paid_orders_count || 0} orders · {u.licenses_count || 0} keys
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-700">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              ACTIVE
                            </span>
                          ) : u.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-700">
                              <Clock className="h-3.5 w-3.5" />
                              PENDING
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-mono font-bold text-rose-700">
                              <Ban className="h-3.5 w-3.5" />
                              SUSPENDED
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {u.status !== 'ACTIVE' && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleStatusChange(u, 'ACTIVE')}
                                className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Activate</span>
                              </button>
                            )}

                            {u.status !== 'SUSPENDED' && u.role !== 'ADMIN' && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleStatusChange(u, 'SUSPENDED')}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer disabled:opacity-50"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                <span>Suspend</span>
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