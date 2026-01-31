export type Company = {
  id: string;
  code: string;
  name: string;
  address: string | null;
  city: string | null;
  zip: string | null;
  iconUrl: string | null;
  active: boolean;
};

export type CompanyAppSummary = {
  appId: string;
  appName: string;
  latestPublishedVersionName: string | null;
  publishedUsersCount: number;
};

export type CompanyUserStatus = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  status: "REGISTERED" | "VERIFIED" | "REJECTED";
  active: boolean;
  lastLoggedInAt: string | null;
};

export type CompanyListResponse = {
  items: Company[];
  page: number;
  pageSize: number;
  total: number;
};

export type CreateCompanyRequest = {
  code: string;
  name: string;
  active: boolean;
  address: string | null;
  city: string | null;
  zip: string | null;
  iconUrl: string | null;
};
