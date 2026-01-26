export type Installation = {
  id: string;
  userId: string;
  userFullName: string;
  appVersionId: string;
  appVersionName: string;
  appVersionCode: string;
  appVersionPlatform: string;
  appId: string;
  appName: string | null;
  installedAt: string;
  createdAt: string;
};

export type InstallationListResponse = Installation[];
