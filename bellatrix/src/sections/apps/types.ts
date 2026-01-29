export type AppRow = {
  id: string;
  iconUrl: string | null;
  displayName: string;
  packageName: string;
  isActive: boolean;
};

export type AppData = {
  displayName: string;
  packageName: string;
  description: string;
  iconUrl: string;
  active: boolean;
  reason?: string;
};

export type AppFormValues = AppData & {
  iconFile: File | string | null;
};
