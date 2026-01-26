export type Permission = {
  id: string;
  key: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
};

export type PermissionListResponse = Permission[];
