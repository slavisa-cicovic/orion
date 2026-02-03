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

export async function getHomeApps(): Promise<HomeAppCard[]> {
  const res = await axiosInstance.get<HomeAppCard[]>("/mobile/home/apps");
  return res.data;
}

export async function publishAppToCompanyUsers(appId: number): Promise<HomeAppCard> {
  const res = await axiosInstance.post<HomeAppCard>(`/mobile/home/apps/${appId}/publish`);
  return res.data;
}
