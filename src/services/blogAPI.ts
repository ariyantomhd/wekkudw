// src/services/blogAPI.ts
import apiClient, { normalizeApiError } from './apiClient';

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  badge_color?: string;
  count?: number;
}

export interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string[];
  category_id?: number | null;
  category?: string;
  author?: string;
  image_url?: string | null;
  is_featured?: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  comments_count?: number;
}

export interface SaveBlogArticlePayload {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string[];
  category_id?: number | null;
  author?: string;
  image_url?: string | null;
  is_featured?: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
}

export async function getAdminBlogCategories(): Promise<BlogCategory[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: BlogCategory[] }>(
      '/admin/blog/categories'
    );
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createAdminBlogCategory(payload: {
  name: string;
  badge_color?: string;
}): Promise<BlogCategory> {
  try {
    const { data } = await apiClient.post<{ success: boolean; data: BlogCategory }>(
      '/admin/blog/categories',
      payload
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getAdminBlogArticles(params?: {
  category_id?: string;
  status?: string;
  search?: string;
}): Promise<BlogArticle[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: BlogArticle[] }>(
      '/admin/blog',
      { params }
    );
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createAdminBlogArticle(
  payload: SaveBlogArticlePayload
): Promise<BlogArticle> {
  try {
    const { data } = await apiClient.post<{ success: boolean; data: BlogArticle }>(
      '/admin/blog',
      payload
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateAdminBlogArticle(
  id: number,
  payload: Partial<SaveBlogArticlePayload>
): Promise<BlogArticle> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; data: BlogArticle }>(
      `/admin/blog/${id}`,
      payload
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteAdminBlogArticle(id: number): Promise<void> {
  try {
    await apiClient.delete(`/admin/blog/${id}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}