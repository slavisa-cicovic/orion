import { useMemo } from "react";
import useSWR from "swr";
import { endpoints, fetcher } from "@/utils/axios";
import { PermissionListResponse } from "@/api/types/permissions";
import { mapPermissionsToRows } from "@/api/mappings/permissions";

type PermissionsQuery = {
  isSystem?: boolean;
  search?: string;
};

export function useGetPermissions(params?: PermissionsQuery) {
  const query = new URLSearchParams();
  if (params?.isSystem !== undefined) query.set("isSystem", String(params.isSystem));
  if (params?.search) query.set("search", params.search);

  const url = params ? `${endpoints.permissions.list}?${query.toString()}` : endpoints.permissions.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR<PermissionListResponse>(url, fetcher);

  return useMemo(
    () => ({
      permissions: data ?? [],
      permissionRows: mapPermissionsToRows(data ?? []),
      total: data?.length ?? 0,
      permissionsLoading: isLoading,
      permissionsError: error,
      permissionsValidating: isValidating,
      permissionsEmpty: !isLoading && !data?.length,
      mutate
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}
