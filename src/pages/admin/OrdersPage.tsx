// src/pages/OrdersPage.tsx
import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { OrderDetailDrawer } from '../../components/orders/OrderDetailDrawer';
import { OrdersTable } from '../../components/orders/OrdersTable';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { FilterTabOption, FilterToolbar } from '../../components/ui/FilterToolbar';
import { PaginationBar } from '../../components/ui/PaginationBar';
import { useAdminSession } from '../../hooks/useAdminSession';
import { extractApiErrorMessage } from '../../services/apiClient';
import {
  getAdminOrders,
  getOrderDetail,
  OrderDetailData,
  updateOrderStatus,
} from '../../services/orderAPI';
import type { OrderStatus } from '../../types/enums';
import type { Order } from '../../types/order';

type OrderStatusFilter = 'ALL' | OrderStatus;

const ORDER_STATUS_TABS: Array<FilterTabOption<OrderStatusFilter>> = [
  { label: 'All', value: 'ALL' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Refunded', value: 'REFUNDED' },
];

export function OrdersPage() {
  const { adminUser, signingOut, handleLogout } = useAdminSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrders = useCallback(
    async (targetPage = page, targetStatus = statusFilter, targetSearch = searchQuery) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminOrders({
          page: targetPage,
          limit: 20,
          status: targetStatus !== 'ALL' ? targetStatus : undefined,
          search: targetSearch.trim() || undefined,
        });
        setOrders(res.data || []);
        setTotalPages(res.pagination?.total_pages ?? 1);
        setTotalRows(res.pagination?.total_rows);
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [page, statusFilter, searchQuery]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders(page, statusFilter, searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [loadOrders, page, statusFilter, searchQuery]);

  const handleTabChange = (nextTab: OrderStatusFilter) => {
    setStatusFilter(nextTab);
    setPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };

  const handleInspectOrder = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingDetail(true);
    try {
      const res = await getOrderDetail(order.id);
      if (res.data) {
        setSelectedOrder(res.data);
      }
    } catch {
      // Keep summary order data open in drawer if detail endpoint fails
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingStatus(true);
    setError(null);
    try {
      const res = await updateOrderStatus(orderId, nextStatus);
      const updated = res.data;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setSelectedOrder((prev) =>
        prev && prev.id === orderId ? { ...prev, ...updated } : updated
      );
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <AdminLayout
      title="Orders & Transactions"
      breadcrumbs={[
        { label: 'Admin', to: '/admin/dashboard' },
        { label: 'Orders' },
      ]}
      adminUser={adminUser}
      signingOut={signingOut}
      onLogout={handleLogout}
    >
      <div className="space-y-5">
        {error && (
          <AlertBanner
            variant="warning"
            message={error}
            onRetry={() => loadOrders(page, statusFilter, searchQuery)}
          />
        )}

        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by invoice number, buyer ID, or gateway ref..."
          tabs={ORDER_STATUS_TABS}
          activeTab={statusFilter}
          onTabChange={handleTabChange}
          onRefresh={() => loadOrders(page, statusFilter, searchQuery)}
          refreshing={loading}
        />

        <OrdersTable
          orders={orders}
          totalCount={totalRows ?? orders.length}
          loading={loading}
          onInspect={handleInspectOrder}
        />

        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalRows={totalRows}
          onPageChange={setPage}
        />
      </div>

      <OrderDetailDrawer
        order={selectedOrder}
        loadingDetail={loadingDetail}
        updatingStatus={updatingStatus}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </AdminLayout>
  );
}