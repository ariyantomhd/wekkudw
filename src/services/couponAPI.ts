// src/services/couponAPI.ts
import apiClient, { normalizeApiError } from './apiClient';

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED';

export interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_purchase: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminCouponPayload {
  code: string;
  description?: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_purchase?: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  is_active?: boolean;
  expires_at?: string | null;
}

export async function getAdminCoupons(params?: {
  status?: string;
  search?: string;
}): Promise<AdminCoupon[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: AdminCoupon[] }>(
      '/admin/coupons',
      { params }
    );
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createAdminCoupon(payload: AdminCouponPayload): Promise<AdminCoupon> {
  try {
    const { data } = await apiClient.post<{ success: boolean; data: AdminCoupon }>(
      '/admin/coupons',
      payload
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateAdminCoupon(
  id: string,
  payload: Partial<AdminCouponPayload>
): Promise<AdminCoupon> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; data: AdminCoupon }>(
      `/admin/coupons/${id}`,
      payload
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function toggleAdminCoupon(id: string): Promise<AdminCoupon> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; data: AdminCoupon }>(
      `/admin/coupons/${id}/toggle`
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteAdminCoupon(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/coupons/${id}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}