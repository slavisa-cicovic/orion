export type AppRow = {
  id: string;
  displayName: string;
  packageName: string;
  isActive: boolean;
  createdAt: string;
};

export type AppData = {
  displayName: string;
  packageName: string;
  description: string;
  iconUrl: string;
  ownerCompanyId: string;
};
