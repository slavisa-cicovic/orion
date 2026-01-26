import { useMemo } from "react";
import useSWR from "swr";
import axiosInstance, { endpoints, fetcher } from "@/utils/axios";
import { Company, CompanyListResponse } from "@/api/types/companies";
import { mapCompaniesToRows, mapCompanyDataToCreateCompanyRequest } from "@/api/mappings/companies";
import { CompanyData } from "@/sections/companies/types";

type CompaniesQuery = {
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};

export function useGetCompanies(params?: CompaniesQuery) {
  const query = new URLSearchParams();
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.search) query.set("search", params.search);
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  if (params?.sort) query.set("sort", params.sort);

  const url = params ? `${endpoints.companies.list}?${query.toString()}` : endpoints.companies.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR<CompanyListResponse>(url, fetcher);

  return useMemo(
    () => ({
      companies: data?.items ?? [],
      companyRows: mapCompaniesToRows(data?.items ?? []),
      total: data?.total ?? 0,
      page: data?.page ?? 0,
      pageSize: data?.pageSize ?? 0,
      companiesLoading: isLoading,
      companiesError: error,
      companiesValidating: isValidating,
      companiesEmpty: !isLoading && !data?.items?.length,
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
  async deleteCompanies(companyIds: Array<number | string>, reason: string): Promise<void> {
    const payload = {
      companyIds: companyIds.map((id) => Number(id)).filter((id) => Number.isFinite(id)),
      reason
    };
    await axiosInstance.delete(endpoints.companies.list, { data: payload });
  },
  async updateCompaniesStatus(
    companyIds: Array<number | string>,
    active: boolean,
    reason: string
  ): Promise<void> {
    const payload = {
      companyIds: companyIds.map((id) => Number(id)).filter((id) => Number.isFinite(id)),
      active,
      reason
    };
    await axiosInstance.post(`${endpoints.companies.list}/status`, payload);
  }
};
