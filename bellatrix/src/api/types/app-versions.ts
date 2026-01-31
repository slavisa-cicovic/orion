export type AppVersion = {
  id: string;
  applicationId: string;
  applicationName: string | null;
  versionName: string;
  platform: "ANDROID" | "IOS";
  minSdk: number | null;
  targetSdk: number | null;
  fileUrl: string;
  originalFileName: string | null;
  checksum: string;
  status: string;
  publishedCompaniesCount: number;
  totalCompaniesCount: number;
  active: boolean;
};

export type AppVersionListResponse = AppVersion[];

export type CreateAppVersionRequest = {
  applicationId: number;
  versionName: string;
  platform: "ANDROID" | "IOS";
  minSdk?: number | null;
  targetSdk?: number | null;
  fileUrl?: string | null;
  originalFileName?: string | null;
  checksum?: string | null;
  active: boolean;
};

export type UpdateAppVersionRequest = {
  versionName: string;
  platform: "ANDROID" | "IOS";
  minSdk?: number | null;
  targetSdk?: number | null;
  fileUrl?: string | null;
  originalFileName?: string | null;
  checksum?: string | null;
  active: boolean;
  reason: string;
};

export type PublishAppVersionRequest = {
  companyIds: number[];
  reason: string;
};

export type AppVersionCompanyStatus = {
  companyId: number;
  companyName: string;
  address: string | null;
  city: string | null;
  zip: string | null;
  latestPublishedVersionName: string | null;
  publishedToCompany: boolean;
  publishedToUsers: boolean;
  selectable: boolean;
  selectableReason: string | null;
};
