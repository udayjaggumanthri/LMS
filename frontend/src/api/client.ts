import axios from 'axios';

function resolveApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location.hostname === 'uat.prajnadharaedu.com') {
    return `${window.location.origin}/api`;
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

/** Turn host-specific media links into a same-origin path so HTTPS pages can load them. */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const value = String(url).trim();
  if (!value || value.startsWith('data:') || value.startsWith('blob:')) return value;
  return value.replace(/https?:\/\/[^/"'\s<]+(\/media\/[^"'\\\s<]*)/g, '$1');
}

function rewriteMediaPayload<T>(data: T): T {
  if (typeof data === 'string') return resolveMediaUrl(data) as T;
  if (Array.isArray(data)) return data.map((item) => rewriteMediaPayload(item)) as T;
  if (data && typeof data === 'object') {
    const next: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      next[key] = rewriteMediaPayload(value);
    }
    return next as T;
  }
  return data;
}

export function apiErrorMessage(err: unknown, fallback: string) {
  const data = (err as { response?: { data?: unknown }; message?: string })?.response?.data;
  const message = (err as { message?: string })?.message;
  if (!data) return message || fallback;
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && data) {
    const record = data as Record<string, unknown>;
    if (typeof record.error === 'string') return record.error;
    if (typeof record.detail === 'string') return record.detail;
    const first = Object.values(record)[0];
    if (Array.isArray(first) && first.length) return String(first[0]);
    if (typeof first === 'string') return first;
  }
  return message || fallback;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('prajnadhara_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => {
    if (response?.data && typeof response.data === 'object') {
      response.data = rewriteMediaPayload(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('prajnadhara_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('prajnadhara_token', newAccess);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('prajnadhara_token');
          localStorage.removeItem('prajnadhara_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);
