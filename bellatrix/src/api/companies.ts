import { useMemo } from "react";
import useSWR from "swr";
import axiosInstance, { endpoints, fetcher } from "@/utils/axios";
import { Company, CompanyListResponse } from "@/api/types/companies";
import { mapCompaniesToRows, mapCompanyDataToCreateCompanyRequest } from "@/api/mappings/companies";
import { CompanyData } from "@/sections/companies/types";

type CompaniesQuery = {
  isActive?: boolean;
  search?: string;
};

export function useGetCompanies(params?: CompaniesQuery) {
  const query = new URLSearchParams();
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.search) query.set("search", params.search);

  const url = params ? `${endpoints.companies.list}?${query.toString()}` : endpoints.companies.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR<CompanyListResponse>(url, fetcher);

  return useMemo(
    () => ({
      companies: data ?? [],
      companyRows: mapCompaniesToRows(data ?? []),
      total: data?.length ?? 0,
      companiesLoading: isLoading,
      companiesError: error,
      companiesValidating: isValidating,
      companiesEmpty: !isLoading && !data?.length,
      mutate
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

export const CompanyApi = {
  async createCompany(companyData: CompanyData): Promise<Company> {
    const payload = mapCompanyDataToCreateCompanyRequest(companyData);
    const res = await axiosInstance.post(endpoints.companies.list, payload);

    return res.data;
  },
};
