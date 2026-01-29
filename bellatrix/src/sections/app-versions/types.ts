export type AppVersionRow = {
  id: string;
  appName: string;
  versionName: string;
  versionCode: number;
  platform: "ANDROID" | "IOS";
  status: string;
  createdAt: string;
};
