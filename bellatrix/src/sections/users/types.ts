export type UserRow = {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  isActive: boolean;
  createdAt: string;
};

export type UserData = {
  email: string;
  fullName: string;
  companyId: string;
  password: string;
};
