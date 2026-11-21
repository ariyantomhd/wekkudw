import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from '../types';
import type { User } from '../types/auth';

export const TOKEN_STORAGE_KEY = 'admin_token';
export const USER_STORAGE_KEY = 'admin_user';
export const PREVIEW_SESSION_KEY = 'tmv_preview_session';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://localhost:5000/api';

export class AdminApiError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: string;

  constructor(
    message: string,
    options?: { status?: number; code?: string; details?: string },
  ) {
    super(message);
    this.name = 'AdminApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getStoredAdminUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredAdminUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function isPreviewSessionActive(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(PREVIEW_SESSION_KEY) === '1';
}

// Single-flight promise registry (resets automatically on completion or failure)
const inflightRequests = new Map<string, Promise<unknown>>();

export function singleFlight<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inflightRequests.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = fetcher().finally(() => {
    inflightRequests.delete(key);
  });

  inflightRequests.set(key, promise);
  return promise;
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(PREVIEW_SESSION_KEY);
  inflightRequests.clear();
}

export function extractApiErrorMessage(err: unknown): string {
  if (err instanceof AdminApiError) {
    return err.details || err.message;
  }

  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiResponse<unknown>>;
    const status = axiosErr.response?.status;
    const serverMsg =
      axiosErr.response?.data?.error?.details ||
      axiosErr.response?.data?.message ||
      axiosErr.response?.statusText;

    if (status === 401) {
      return serverMsg || 'Sesi admin telah berakhir atau token tidak valid (401 Unauthorized).';
    }
    if (status === 403) {
      return serverMsg || 'Akses ditolak: Anda tidak memiliki izin admin untuk aksi ini (403 Forbidden).';
    }
    if (serverMsg) return serverMsg;
    if (axiosErr.code === 'ERR_NETWORK' || !axiosErr.response) {
      return `Unable to reach tmv-admin-be at ${API_BASE_URL}. Ensure the Express backend is running and CORS is enabled.`;
    }
    return axiosErr.message;
  }

  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}

export function normalizeApiError(err: unknown): AdminApiError {
  if (err instanceof AdminApiError) return err;

  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiResponse<unknown>>;
    const status = axiosErr.response?.status;
    const code = axiosErr.response?.data?.error?.code || axiosErr.code;
    const details = axiosErr.response?.data?.error?.details;
    const message = extractApiErrorMessage(err);
    return new AdminApiError(message, { status, code, details });
  }

  return new AdminApiError(extractApiErrorMessage(err));
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

// Request Interceptor: inject Bearer token & anti-cache headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(normalizeApiError(error)),
);

// Auto-Retry Interceptor: handle Vercel serverless cold start or transient network hiccups on GET requests
apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as
    | (InternalAxiosRequestConfig & { _retryCount?: number })
    | undefined;
  const status = error.response?.status;
  const isRetryable =
    config &&
    config.method?.toLowerCase() === 'get' &&
    (!status ||
      error.code === 'ECONNABORTED' ||
      [404, 500, 502, 503, 504].includes(status));

  if (isRetryable) {
    config._retryCount = (config._retryCount ?? 0) + 1;
    if (config._retryCount <= 2) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1200 * config._retryCount!),
      );
      return apiClient.request(config);
    }
  }

  return Promise.reject(error);
});

// Response Interceptor: handle 401 Unauthorized and 403 Forbidden globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;

    if (status === 401) {
      clearAdminSession();
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/admin/login')
      ) {
        window.location.assign('/admin/login');
      }
    }

    if (status === 403) {
      return Promise.reject(
        new AdminApiError(
          error.response?.data?.message ||
            'Akses ditolak (403 Forbidden). Akun ini tidak memiliki hak akses admin.',
          {
            status: 403,
            code: error.response?.data?.error?.code || 'FORBIDDEN',
            details: error.response?.data?.error?.details,
          },
        ),
      );
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export default apiClient;