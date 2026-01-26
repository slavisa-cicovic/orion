export type App = {
  id: string;
  packageName: string;
  displayName: string;
  description: string | null;
  iconUrl: string | null;
  ownerCompanyId: string | null;
  isActive: boolean;
  createdAt: string;
};

export type AppListResponse = {
  items: App[];
  totalCount?: number;
};

export type CreateAppRequest = {
  displayName: string;
  packageName: string;
  description: string | null;
  iconUrl: string | null;
  ownerCompanyId: string | null;
};
