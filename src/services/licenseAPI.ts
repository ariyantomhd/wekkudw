// src/services/licenseAPI.ts
import apiClient, { normalizeApiError } from './apiClient';

export type LicenseStatusType = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'SUSPENDED';

export interface AdminLicense {
  id: string;
  license_key: string;
  order_item_id: string;
  product_id: string;
  buyer_id: string;
  license_type: string;
  activated_domains: string[];
  activation_count: number;
  status: LicenseStatusType;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  buyer?: {
    id: string;
    username?: string;
    email: string;
  } | null;
  invoice_number?: string | null;
}

export async function getAdminLicenses(params?: {
  status?: string;
  license_type?: string;
  search?: string;
}): Promise<AdminLicense[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: AdminLicense[] }>(
      '/admin/licenses',
      { params }
    );
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateAdminLicenseStatus(
  id: string,
  status: LicenseStatusType
): Promise<AdminLicense> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; data: AdminLicense }>(
      `/admin/licenses/${id}/status`,
      { status }
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function resetAdminLicenseDomains(
  id: string,
  domain?: string
): Promise<AdminLicense> {
  try {
    const { data } = await apiClient.post<{ success: boolean; data: AdminLicense }>(
      `/admin/licenses/${id}/reset-domains`,
      domain ? { domain } : {}
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}