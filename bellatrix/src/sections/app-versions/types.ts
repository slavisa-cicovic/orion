export type AppVersionRow = {
  id: string;
  appName: string;
  versionName: string;
  platform: "ANDROID" | "IOS";
  status: string;
  active: boolean;
};
