import { useMemo } from "react";
import useSWR from "swr";
import axiosInstance, { endpoints, fetcher } from "@/utils/axios";
import { User, UserAppSummary, UserListResponse } from "@/api/types/users";
import { mapUsersToRows, mapUserDataToCreateUserRequest, mapUserDataToUpdateUserRequest } from "@/api/mappings/users";
import { UserData } from "@/sections/users/types";

type UsersQuery = {
  companyId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};

export function useGetUsers(params?: UsersQuery) {
  const query = new URLSearchParams();
  if (params?.companyId) query.set("companyId", params.companyId);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.search) query.set("search", params.search);
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  if (params?.sort) query.set("sort", params.sort);

  const url = params ? `${endpoints.users.list}?${query.toString()}` : endpoints.users.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR<UserListResponse>(url, fetcher);

  return useMemo(
    () => ({
      users: data?.items ?? [],
      userRows: mapUsersToRows(data?.items ?? []),
      total: data?.total ?? 0,
      page: data?.page ?? 0,
      pageSize: data?.pageSize ?? 0,
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.items?.length,
      mutate
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

export function useGetUser(userId: string | null) {
  const url = userId ? endpoints.users.details(userId) : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR<User>(url, fetcher);

  return useMemo(
    () => ({
      user: data ?? null,
      userLoading: isLoading,
      userError: error,
      userValidating: isValidating,
      mutate
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

export function useGetUserApps(userId: string | null) {
  const url = userId ? endpoints.users.apps(userId) : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR<UserAppSummary[]>(url, fetcher);

  return useMemo(
    () => ({
      apps: data ?? [],
      appsLoading: isLoading,
      appsError: error,
      appsValidating: isValidating,
      appsEmpty: !isLoading && !data?.length,
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
  },
  async updateUser(userId: string, userData: UserData): Promise<User> {
    const reason = userData.reason ?? "";
    const payload = mapUserDataToUpdateUserRequest(userData, reason);
    const res = await axiosInstance.put(endpoints.users.details(userId), payload);

    return res.data;
  },
  async deleteUsers(userIds: Array<number | string>, reason: string): Promise<void> {
    const payload = {
      userIds: userIds.map((id) => Number(id)).filter((id) => Number.isFinite(id)),
      reason
    };
    await axiosInstance.delete(endpoints.users.list, { data: payload });
  },
  async updateUsersStatus(
    userIds: Array<number | string>,
    active: boolean,
    reason: string
  ): Promise<void> {
    const payload = {
      userIds: userIds.map((id) => Number(id)).filter((id) => Number.isFinite(id)),
      active,
      reason
    };
    await axiosInstance.post(`${endpoints.users.list}/status`, payload);
  }
};
