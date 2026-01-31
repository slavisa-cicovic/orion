import CompanyDetailsView from "@/sections/companies/view/company-details-view";

type Props = {
  params: { id: string };
};

export default function CompanyDetailsPage({ params }: Props) {
  return <CompanyDetailsView companyId={params.id} />;
}
