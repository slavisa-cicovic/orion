export type CompanyRow = {
  id: string;
  iconUrl: string | null;
  code: string;
  name: string;
  city: string;
  zip: string;
  active: boolean;
};

export type CompanyData = {
  code: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  iconUrl: string;
  active: boolean;
  reason?: string;
};

export type CompanyAppRow = {
  appId: string;
  appName: string;
  latestPublishedVersionName: string;
  publishedUsersCount: number;
};

export type CompanyUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  active: boolean;
  lastLoggedInAt: string | null;
};
