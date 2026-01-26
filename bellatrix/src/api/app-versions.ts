import { useMemo } from "react";
import useSWR from "swr";
import { endpoints, fetcher } from "@/utils/axios";
import { AppVersionListResponse } from "@/api/types/app-versions";
import { mapAppVersionsToRows } from "@/api/mappings/app-versions";

type AppVersionsQuery = {
  appId: string | null;
  platform?: "ANDROID" | "IOS";
};

export function useGetAppVersions(params: AppVersionsQuery) {
  const query = new URLSearchParams();
  if (params.platform) query.set("platform", params.platform);

  const url = params.appId
    ? `${endpoints.appVersions.list(params.appId)}?${query.toString()}`
    : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR<AppVersionListResponse>(url, fetcher);

  return useMemo(
    () => ({
      versions: data ?? [],
      versionRows: mapAppVersionsToRows(data ?? []),
      total: data?.length ?? 0,
      versionsLoading: isLoading,
      versionsError: error,
      versionsValidating: isValidating,
      versionsEmpty: !isLoading && !data?.length,
      mutate
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}
