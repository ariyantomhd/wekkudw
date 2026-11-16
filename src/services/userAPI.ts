// src/services/userAPI.ts
import apiClient, { normalizeApiError } from './apiClient';

export type UserRoleType = 'BUYER' | 'CREATOR' | 'ADMIN';
export type UserAccountStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export interface AdminUserRecord {
  id: string;
  email: string;
  username: string;
  creator_number: number | null;
  avatar_url: string | null;
  role: UserRoleType;
  status: UserAccountStatus;
  last_login_ip: string | null;
  last_device: string | null;
  last_country: string | null;
  is_vpn_detected: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
  paid_orders_count?: number;
  total_spent?: number;
  licenses_count?: number;
}

export async function getAdminUsers(params?: {
  role?: string;
  status?: string;
  vpn_only?: boolean;
  search?: string;
}): Promise<AdminUserRecord[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: AdminUserRecord[] }>(
      '/admin/users',
      { params }
    );
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateAdminUserRole(
  id: string,
  role: UserRoleType
): Promise<AdminUserRecord> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; data: AdminUserRecord }>(
      `/admin/users/${id}/role`,
      { role }
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateAdminUserStatus(
  id: string,
  status: UserAccountStatus
): Promise<AdminUserRecord> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; data: AdminUserRecord }>(
      `/admin/users/${id}/status`,
      { status }
    );
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}