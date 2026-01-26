export type AppVersion = {
  id: string;
  appId: string;
  appName: string | null;
  versionName: string;
  versionCode: number;
  platform: "ANDROID" | "IOS";
  minSdk: number | null;
  targetSdk: number | null;
  fileUrl: string;
  checksum: string;
  sizeBytes: number | null;
  releaseNotes: string | null;
  status: string;
  createdAt: string;
};

export type AppVersionListResponse = AppVersion[];
