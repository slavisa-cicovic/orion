import { Company, CreateCompanyRequest } from "@/api/types/companies";
import { CompanyData, CompanyRow } from "@/sections/companies/types";

export function mapCompanyToRow(company: Company): CompanyRow {
  return {
    id: company.id,
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

  return {
    code: companyData.code.trim(),
    name: companyData.name.trim(),
    active: companyData.active,
    address: address.length > 0 ? address : null,
    city: city.length > 0 ? city : null,
    zip: zip.length > 0 ? zip : null
  };
}
