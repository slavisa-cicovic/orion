export type Role = {
  id: string;
  name: string;
  description: string | null;
  allowsMobile: boolean;
  isSystem: boolean;
  createdAt: string;
};

export type RoleListResponse = Role[];
