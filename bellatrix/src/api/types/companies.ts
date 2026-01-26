export type Company = {
  id: string;
  code: string;
  name: string;
  address: string | null;
  city: string | null;
  zip: string | null;
  active: boolean;
};

export type CompanyListResponse = Company[];

export type CreateCompanyRequest = {
  code: string;
  name: string;
  active: boolean;
  address: string | null;
  city: string | null;
  zip: string | null;
};
