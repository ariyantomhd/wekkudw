// src/services/dealAPI.ts
import apiClient, { normalizeApiError } from './apiClient';

export interface AdminDealProductSummary {
  id: string;
  title: string;
  slug: string;
  regular_price: number;
  category_id: string | null;
  images_url: string | null;
}

export interface AdminDeal {
  id: string;
  product_id: string;
  deal_title: string | null;
  deal_badge: string;
  deal_price: number;
  discount_percent: number;
  is_flash_sale: boolean;
  quota_limit: number | null;
  quota_claimed: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: AdminDealProductSummary | null;
}

export interface AdminDealPayload {
  product_id: string;
  deal_title?: string | null;
  deal_badge?: string;
  deal_price: number;
  is_flash_sale?: boolean;
  quota_limit?: number | null;
  starts_at?: string;
  expires_at: string;
  is_active?: boolean;
}

export async function getAdminDeals(params?: {
  status?: string;
  search?: string;
}): Promise<AdminDeal[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: AdminDeal[] }>(
      '/admin/deals',
      { params }
    );
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createAdminDeal(payload: AdminDealPayload): Promise<AdminDeal> {
  try {
    const { data } = await apiClient.post<{ success: boolean; data: AdminDeal }>(
      '/admin/deals',
      payload
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateAdminDeal(
  id: string,
  payload: Partial<AdminDealPayload>
): Promise<AdminDeal> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; data: AdminDeal }>(
      `/admin/deals/${id}`,
      payload
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function toggleAdminDeal(id: string): Promise<AdminDeal> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; data: AdminDeal }>(
      `/admin/deals/${id}/toggle`
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteAdminDeal(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/deals/${id}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}