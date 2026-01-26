export type User = {
  id: string;
  companyId: string;
  companyName: string | null;
  email: string;
  fullName: string | null;
  isActive: boolean;
  createdAt: string;
};

export type UserListResponse = User[];

export type CreateUserRequest = {
  companyId: string;
  email: string;
  fullName: string | null;
  password: string;
};
