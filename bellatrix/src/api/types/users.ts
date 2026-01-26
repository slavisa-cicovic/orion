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

export type UserListResponse = User[];

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
