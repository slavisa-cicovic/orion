import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@src/constants/config";
import { useAuthStore } from "@src/state/auth-store";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryConfig = AxiosRequestConfig & { _retry?: boolean };
type RefreshResponse = { accessToken: string; refreshToken: string };

let refreshPromise: Promise<RefreshResponse> | null = null;

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config ?? {}) as RetryConfig;
    const status = error.response?.status;
    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh");

    if (!isAuthRoute && (status === 401 || status === 403) && !originalRequest._retry) {
      const currentRefreshToken = useAuthStore.getState().refreshToken;

      if (!currentRefreshToken) {
        await useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: currentRefreshToken,
            })
            .then((res) => res.data)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const refreshed = await refreshPromise;
        useAuthStore.getState().setSession({
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
        });

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401 || status === 403) {
      await useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);
