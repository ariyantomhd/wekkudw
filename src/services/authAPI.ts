import type { ApiResponse, AuthTokenResponse, LoginPayload, User } from '../types';
import apiClient, {
  clearAdminSession,
  normalizeApiError,
  setAdminToken,
  setStoredAdminUser,
} from './apiClient';

export async function loginAdmin(
  payload: LoginPayload,
): Promise<ApiResponse<AuthTokenResponse>> {
  try {
    const { data } = await apiClient.post<ApiResponse<AuthTokenResponse>>(
      '/admin/auth/login',
      payload,
    );
    const token = data.data?.token || data.data?.access_token;
    if (token) {
      setAdminToken(token);
    }
    if (data.data?.user) {
      setStoredAdminUser(data.data.user);
    }
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getAdminProfile(): Promise<ApiResponse<User>> {
  try {
    const { data } = await apiClient.get<ApiResponse<User>>('/admin/auth/me');
    if (data.data) {
      setStoredAdminUser(data.data);
    }
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiClient.post('/admin/auth/logout');
  } catch {
    // Clear local credentials even if logout endpoint is unreachable
  } finally {
    clearAdminSession();
  }
}

export const authAPI = {
  loginAdmin,
  getAdminProfile,
  logoutAdmin,
};

export default authAPI;
