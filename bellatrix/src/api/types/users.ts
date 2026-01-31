export type User = {
  id: number;
  companyId: number | null;
  companyName: string | null;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  roles: string[];
  active: boolean;
  fullName?: string | null;
};

export type UserListResponse = {
  items: User[];
  page: number;
  pageSize: number;
  total: number;
};

export type UserAppSummary = {
  appId: string;
  appName: string;
  versionName: string;
  status: string;
};

export type CreateUserRequest = {
  username: string;
  companyId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  password: string;
  active: boolean;
};

export type UpdateUserRequest = {
  username: string;
  companyId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  password?: string;
  active: boolean;
  reason: string;
};
