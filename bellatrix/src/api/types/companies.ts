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
