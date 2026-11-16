import { useCallback, useEffect, useState } from 'react';
import { DashboardStatsStrip } from '../../components/dashboard/DashboardStatsStrip';
import { RecentOrdersTable } from '../../components/dashboard/RecentOrdersTable';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { useAdminSession } from '../../hooks/useAdminSession';
import { extractApiErrorMessage } from '../../services/apiClient';
import { getDashboardSummary } from '../../services/dashboardAPI';
import { getAdminOrders } from '../../services/orderAPI';
import { getAdminProducts } from '../../services/productAPI';
import type { AdminDashboardStats } from '../../types/dashboard';
import type { Order } from '../../types/order';

export function DashboardPage() {
  const { adminUser, signingOut, handleLogout } = useAdminSession();
  const [stats, setStats] = useState<AdminDashboardStats>({
    total_products: 0,
    total_revenue: 0,
    active_orders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardSummary();
      if (res.data?.stats) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recent_orders || []);
      }
    } catch (err) {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          getAdminProducts({ limit: 100 }),
          getAdminOrders({ limit: 10 }),
        ]);
        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const totalRevenue = orders
          .filter((o) => o.payment_status === 'PAID')
          .reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
        const activeOrders = orders.filter(
          (o) => o.payment_status === 'PENDING' || o.payment_status === 'PAID',
        ).length;

        setStats({
          total_products: productsRes.pagination?.total_rows ?? products.length,
          total_revenue: totalRevenue,
          active_orders: activeOrders,
        });
        setRecentOrders(orders.slice(0, 6));
      } catch {
        setError(extractApiErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <AdminLayout
      title="Dashboard Overview"
      breadcrumbs={[
        { label: 'Admin', to: '/admin/dashboard' },
        { label: 'Dashboard' },
      ]}
      primaryAction={{
        label: 'Upload Product',
        to: '/admin/products/create',
      }}
      adminUser={adminUser}
      signingOut={signingOut}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {error && <AlertBanner variant="warning" message={error} onRetry={loadDashboard} />}
        <DashboardStatsStrip stats={stats} loading={loading} />
        <RecentOrdersTable orders={recentOrders} loading={loading} />
      </div>
    </AdminLayout>
  );
}
