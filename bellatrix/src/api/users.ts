import { useMemo } from "react";
import useSWR from "swr";
import axiosInstance, { endpoints, fetcher } from "@/utils/axios";
import { User, UserListResponse } from "@/api/types/users";
import { mapUsersToRows, mapUserDataToCreateUserRequest } from "@/api/mappings/users";
import { UserData } from "@/sections/users/types";

type UsersQuery = {
  companyId?: string;
  isActive?: boolean;
  search?: string;
};

export function useGetUsers(params?: UsersQuery) {
  const query = new URLSearchParams();
  if (params?.companyId) query.set("companyId", params.companyId);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.search) query.set("search", params.search);

  const url = params ? `${endpoints.users.list}?${query.toString()}` : endpoints.users.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR<UserListResponse>(url, fetcher);

  return useMemo(
    () => ({
      users: data ?? [],
      userRows: mapUsersToRows(data ?? []),
      total: data?.length ?? 0,
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.length,
      mutate
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

export const UserApi = {
  async createUser(userData: UserData): Promise<User> {
    const payload = mapUserDataToCreateUserRequest(userData);
    const res = await axiosInstance.post(endpoints.users.list, payload);

    return res.data;
  }
};
