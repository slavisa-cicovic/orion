export type UserRow = {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  isActive: boolean;
};

export type UserData = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyId: string;
  password: string;
  active: boolean;
  reason?: string;
};

export type UserAppRow = {
  appId: string;
  appName: string;
  versionName: string;
  status: string;
};
