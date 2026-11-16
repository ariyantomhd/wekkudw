// src/services/reviewAPI.ts
import apiClient, { normalizeApiError } from './apiClient';

export interface AdminProductReview {
  review_text: string;
  id: string;
  product_id: string;
  buyer_id: string | null;
  order_item_id: string | null;
  reviewer_name: string;
  reviewer_role: string | null;
  reviewer_avatar: string | null;
  rating: number;
  title: string | null;
  comment: string;
  is_admin_injected: boolean;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export interface InjectReviewPayload {
  product_id: string;
  reviewer_name: string;
  reviewer_role?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  is_verified_purchase?: boolean;
  is_approved?: boolean;
  created_at?: string;
}

export async function getAdminReviews(params?: {
  product_id?: string;
  source?: string;
  status?: string;
  search?: string;
}): Promise<AdminProductReview[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: AdminProductReview[] }>(
      '/admin/reviews',
      { params }
    );
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function injectAdminReview(
  payload: InjectReviewPayload
): Promise<AdminProductReview> {
  try {
    const { data } = await apiClient.post<{ success: boolean; data: AdminProductReview }>(
      '/admin/reviews/inject',
      payload
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateAdminReview(
  id: string,
  payload: Partial<InjectReviewPayload>
): Promise<AdminProductReview> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; data: AdminProductReview }>(
      `/admin/reviews/${id}`,
      payload
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function toggleAdminReview(id: string): Promise<AdminProductReview> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; data: AdminProductReview }>(
      `/admin/reviews/${id}/toggle`
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteAdminReview(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/reviews/${id}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}