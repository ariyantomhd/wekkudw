import type { ApiResponse, Order, OrderDetailData, OrderStatus } from '../types';
import {
  extractArrayPayload,
  extractObjectPayload,
  normalizeOrder,
} from '../utils/normalizers';
import apiClient, { normalizeApiError } from './apiClient';

export interface OrderQueryParams {
  status?: OrderStatus | string;
  search?: string;
  page?: number;
  limit?: number;
}

export type { OrderDetailData };

export async function getAdminOrders(
  params?: OrderQueryParams,
): Promise<ApiResponse<Order[]>> {
  try {
    const { data } = await apiClient.get<unknown>('/admin/orders', {
      params,
    });
    return extractArrayPayload(data, normalizeOrder);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getOrderDetail(id: string): Promise<ApiResponse<OrderDetailData>> {
  try {
    const { data } = await apiClient.get<unknown>(`/admin/orders/${id}`);
    return extractObjectPayload(data, normalizeOrder);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ApiResponse<Order>> {
  try {
    const { data } = await apiClient.patch<unknown>(
      `/admin/orders/${id}/status`,
      { payment_status: status },
    );
    return extractObjectPayload(data, normalizeOrder);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const orderAPI = {
  getAdminOrders,
  getOrderDetail,
  updateOrderStatus,
};

export default orderAPI;
