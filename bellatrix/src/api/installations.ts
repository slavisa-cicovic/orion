import { useMemo } from "react";
import useSWR from "swr";
import { endpoints, fetcher } from "@/utils/axios";
import { InstallationListResponse } from "@/api/types/installations";
import { mapInstallationsToRows } from "@/api/mappings/installations";

type InstallationsQuery = {
  userId: string | null;
  appVersionId?: string;
};

export function useGetInstallations(params: InstallationsQuery) {
  const query = new URLSearchParams();
  if (params.userId) query.set("userId", params.userId);
  if (params.appVersionId) query.set("appVersionId", params.appVersionId);

  const url = params.userId ? `${endpoints.installations.list}?${query.toString()}` : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR<InstallationListResponse>(url, fetcher);

  return useMemo(
    () => ({
      installations: data ?? [],
      installationRows: mapInstallationsToRows(data ?? []),
      total: data?.length ?? 0,
      installationsLoading: isLoading,
      installationsError: error,
      installationsValidating: isValidating,
      installationsEmpty: !isLoading && !data?.length,
      mutate
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}
