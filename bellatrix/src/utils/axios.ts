import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios';
import { getAuthToken } from '@/auth/auth-token';
// config

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_HOST_API });

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  apps: {
    list: '/admin/applications',
    details: (id: string) => `/admin/applications/${id}`,
  },
  appVersions: {
    base: "/admin/app-versions",
    list: (appId: string) => `/admin/app-versions/application/${appId}`,
    details: (id: string) => `/admin/app-versions/${id}`,
    companies: (id: string) => `/admin/app-versions/${id}/companies`,
  },
  companies: {
    list: '/admin/companies',
    details: (id: string) => `/admin/companies/${id}`,
    apps: (id: string) => `/admin/companies/${id}/apps`,
    users: (id: string) => `/admin/companies/${id}/users`,
  },
  users: {
    list: '/admin/users',
    details: (id: string) => `/admin/users/${id}`,
    apps: (id: string) => `/admin/users/${id}/apps`,
  },
  roles: {
    list: '/admin/roles',
  },
  permissions: {
    list: '/admin/permissions',
  },
  devices: {
    list: '/user/devices',
  },
  installations: {
    list: '/user/installations',
  },
  uploads: {
    list: '/admin/uploads',
  },
  // TODO for other domains
};
