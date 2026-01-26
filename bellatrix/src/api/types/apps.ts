export type App = {
  id: number;
  packageName: string;
  displayName: string;
  description: string | null;
  iconUrl: string | null;
  ownerCompanyId: number | null;
  active: boolean;
};

export type AppListResponse = {
  items: App[];
  page: number;
  pageSize: number;
  total: number;
};

export type CreateAppRequest = {
  displayName: string;
  packageName: string;
  description: string | null;
  iconUrl: string | null;
  ownerCompanyId: number | null;
  active: boolean;
};
