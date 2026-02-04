import { axiosInstance } from "@src/utils/axios";

export type HomeAppCard = {
  appId: number;
  appName: string;
  appPackageName: string;
  appDescription: string;
  appIconUrl: string | null;
  versionName: string;
  downloadUrl: string | null;
  status: string;
  canPublishToCompanyUsers: boolean;
  publishedToUsersCount: number;
  totalCompanyUsers: number;
};

export type PublishUser = {
  userId: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  pilotUser: boolean;
  published: boolean;
  latestPublishedVersionName: string | null;
  installed: boolean | null;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export async function getHomeApps(): Promise<HomeAppCard[]> {
  const res = await axiosInstance.get<HomeAppCard[]>("/mobile/home/apps");
  return res.data;
}

export async function publishAppToCompanyUsers(appId: number): Promise<HomeAppCard> {
  const res = await axiosInstance.post<HomeAppCard>(`/mobile/home/apps/${appId}/publish`);
  return res.data;
}

export async function getPublishUsers(
  appId: number,
  params: { page: number; pageSize: number; search?: string },
): Promise<PagedResponse<PublishUser>> {
  const res = await axiosInstance.get<PagedResponse<PublishUser>>(`/mobile/home/apps/${appId}/users`, {
    params,
  });
  return res.data;
}

export async function publishToSelectedUsers(appId: number, userIds: number[]): Promise<HomeAppCard> {
  const res = await axiosInstance.post<HomeAppCard>(`/mobile/home/apps/${appId}/publish/users`, {
    userIds,
  });
  return res.data;
}
