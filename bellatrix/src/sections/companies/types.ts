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
};
