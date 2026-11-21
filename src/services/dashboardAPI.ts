import type { AdminDashboardStats, ApiResponse, Order } from '../types';
import {
  normalizeDashboardStats,
  normalizeOrderSummaryList,
} from '../utils/normalizers';
import apiClient, { normalizeApiError } from './apiClient';

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  recent_orders: Order[];
}

export async function getDashboardSummary(): Promise<ApiResponse<AdminDashboardResponse>> {
  try {
    const { data } = await apiClient.get<{
      success?: boolean;
      status_code?: number;
      message?: string;
      data?: Record<string, unknown>;
    }>('/admin/dashboard');

    const root = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
    const payload = (
      root.data && typeof root.data === 'object' ? root.data : root
    ) as Record<string, unknown>;

    const statsSource =
      payload.stats && typeof payload.stats === 'object' ? payload.stats : payload;
    const recentOrdersSource = Array.isArray(payload.recent_orders)
      ? payload.recent_orders
      : Array.isArray(root.recent_orders)
        ? root.recent_orders
        : [];

    return {
      success: typeof root.success === 'boolean' ? root.success : true,
      status_code: typeof root.status_code === 'number' ? root.status_code : undefined,
      message: typeof root.message === 'string' ? root.message : undefined,
      data: {
        stats: normalizeDashboardStats(statsSource),
        recent_orders: normalizeOrderSummaryList(recentOrdersSource),
      },
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const dashboardAPI = {
  getDashboardSummary,
};

export default dashboardAPI;