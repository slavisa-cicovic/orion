import { useMemo } from 'react';
import { mapAppsToRows, mapAppDataToCreateAppRequest } from 'src/api/mappings/apps';
import { App, AppListResponse } from '@/api/types/apps';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import useSWR from 'swr';
import { AppData } from '@/sections/apps/types';

type AppsQuery = {
  search?: string;
  isActive?: boolean;
  ownerCompanyId?: string;
  platform?: 'ANDROID' | 'IOS';
  page?: number;
  pageSize?: number;
  sort?: string;
};

export function useGetApps(params?: AppsQuery) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
  if (params?.ownerCompanyId) query.set('ownerCompanyId', params.ownerCompanyId);
  if (params?.platform) query.set('platform', params.platform);
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize));
  if (params?.sort) query.set('sort', params.sort);

  const URL = params ? `${endpoints.apps.list}?${query.toString()}` : endpoints.apps.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR<AppListResponse>(URL, fetcher);

  return useMemo(
    () => ({
      apps: data?.items ?? [],
      appRows: mapAppsToRows(data?.items ?? []),
      total: data?.total ?? 0,
      appsLoading: isLoading,
      appsError: error,
      appsValidating: isValidating,
      appsEmpty: !isLoading && !data?.items?.length,
      mutate,
    }),
    [data?.items, data?.total, error, isLoading, isValidating, mutate]
  );
}

export const AppApi = {
  async createApp(appData: AppData): Promise<App> {
    const payload = mapAppDataToCreateAppRequest(appData);
    const res = await axiosInstance.post(endpoints.apps.list, payload);

    return res.data;
  }
};
