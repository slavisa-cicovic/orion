import { Company, CreateCompanyRequest } from "@/api/types/companies";
import { CompanyData, CompanyRow } from "@/sections/companies/types";

export function mapCompanyToRow(company: Company): CompanyRow {
  const baseUrl = (process.env.NEXT_PUBLIC_HOST_API ?? "").replace(/\/$/, "");
  const apiBase = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
  const iconUrl = company.iconUrl
    ? `${apiBase}/uploads/${company.iconUrl.replace(/^\/+/, "")}`
    : null;

  return {
    id: company.id,
    iconUrl,
    code: company.code,
    name: company.name,
    city: company.city ?? "-",
    zip: company.zip ?? "-",
    active: company.active
  };
}

export function mapCompaniesToRows(companies: Company[]): CompanyRow[] {
  return companies.map(mapCompanyToRow);
}

export function mapCompanyDataToCreateCompanyRequest(companyData: CompanyData): CreateCompanyRequest {
  const address = companyData.address.trim();
  const city = companyData.city.trim();
  const zip = companyData.zip.trim();
  const iconUrl = companyData.iconUrl.trim();

  return {
    code: companyData.code.trim(),
    name: companyData.name.trim(),
    active: companyData.active,
    address: address.length > 0 ? address : null,
    city: city.length > 0 ? city : null,
    zip: zip.length > 0 ? zip : null,
    iconUrl: iconUrl.length > 0 ? iconUrl : null
  };
}

export function mapCompanyDataToUpdateCompanyRequest(companyData: CompanyData, reason: string) {
  const address = companyData.address.trim();
  const city = companyData.city.trim();
  const zip = companyData.zip.trim();
  const iconUrl = companyData.iconUrl.trim();

  return {
    code: companyData.code.trim(),
    name: companyData.name.trim(),
    reason,
    active: companyData.active,
    address: address.length > 0 ? address : null,
    city: city.length > 0 ? city : null,
    zip: zip.length > 0 ? zip : null,
    iconUrl: iconUrl.length > 0 ? iconUrl : null
  };
}
