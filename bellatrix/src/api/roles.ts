import { useMemo } from "react";
import useSWR from "swr";
import { endpoints, fetcher } from "@/utils/axios";
import { RoleListResponse } from "@/api/types/roles";
import { mapRolesToRows } from "@/api/mappings/roles";

type RolesQuery = {
  isSystem?: boolean;
  allowsMobile?: boolean;
  search?: string;
};

export function useGetRoles(params?: RolesQuery) {
  const query = new URLSearchParams();
  if (params?.isSystem !== undefined) query.set("isSystem", String(params.isSystem));
  if (params?.allowsMobile !== undefined) query.set("allowsMobile", String(params.allowsMobile));
  if (params?.search) query.set("search", params.search);

  const url = params ? `${endpoints.roles.list}?${query.toString()}` : endpoints.roles.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR<RoleListResponse>(url, fetcher);

  return useMemo(
    () => ({
      roles: data ?? [],
      roleRows: mapRolesToRows(data ?? []),
      total: data?.length ?? 0,
      rolesLoading: isLoading,
      rolesError: error,
      rolesValidating: isValidating,
      rolesEmpty: !isLoading && !data?.length,
      mutate
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}
