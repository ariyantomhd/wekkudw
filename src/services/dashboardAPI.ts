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
      data?: {
        stats?: unknown;
        recent_orders?: unknown;
      };
    }>('/admin/dashboard');

    const payload = data?.data ?? (data as unknown as { stats?: unknown; recent_orders?: unknown });

    return {
      success: typeof data?.success === 'boolean' ? data.success : true,
      status_code: data?.status_code,
      message: data?.message,
      data: {
        stats: normalizeDashboardStats(payload?.stats ?? payload),
        recent_orders: normalizeOrderSummaryList(payload?.recent_orders),
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
