import axios from "axios";
import { API_BASE_URL } from "@src/constants/config";
import { useAuthStore } from "@src/state/auth-store";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);
