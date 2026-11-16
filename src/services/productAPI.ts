import type {
  ApiResponse,
  CreateProductInput,
  Product,
  ProductCategory,
  ProductQueryParams,
  UpdateProductInput,
} from '../types';
import {
  extractArrayPayload,
  extractObjectPayload,
  normalizeCategory,
  normalizeProduct,
} from '../utils/normalizers';
import apiClient, { normalizeApiError } from './apiClient';

export async function getAdminProducts(
  params?: ProductQueryParams,
): Promise<ApiResponse<Product[]>> {
  try {
    const { data } = await apiClient.get<unknown>('/admin/products', {
      params,
    });
    return extractArrayPayload(data, normalizeProduct);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getAdminProductById(id: string): Promise<ApiResponse<Product>> {
  try {
    const { data } = await apiClient.get<unknown>(`/admin/products/${id}`);
    return extractObjectPayload(data, normalizeProduct);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getAdminCategories(): Promise<ApiResponse<ProductCategory[]>> {
  try {
    const { data } = await apiClient.get<unknown>('/admin/categories');
    return extractArrayPayload(data, normalizeCategory);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createProduct(
  payload: FormData | CreateProductInput,
  onUploadProgress?: (percentage: number) => void,
): Promise<ApiResponse<Product>> {
  try {
    const { data } = await apiClient.post<unknown>('/admin/products', payload, {
      timeout: 120000,
      onUploadProgress: (progressEvent) => {
        if (!onUploadProgress || !progressEvent.total) return;
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(pct);
      },
    });
    return extractObjectPayload(data, normalizeProduct);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateProduct(
  id: string,
  payload: FormData | UpdateProductInput,
  onUploadProgress?: (percentage: number) => void,
): Promise<ApiResponse<Product>> {
  try {
    const { data } = await apiClient.put<unknown>(
      `/admin/products/${id}`,
      payload,
      {
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          if (!onUploadProgress || !progressEvent.total) return;
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(pct);
        },
      },
    );
    return extractObjectPayload(data, normalizeProduct);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    const { data } = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/admin/products/${id}`,
    );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const productAPI = {
  getAdminProducts,
  getAdminProductById,
  getAdminCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productAPI;
