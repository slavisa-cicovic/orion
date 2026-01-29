import AppDetailsView from "@/sections/apps/view/app-details-view";

type Props = {
  params: {
    id: string;
  };
};

export default function AppDetailsPage({ params }: Props) {
  return <AppDetailsView appId={params.id} />;
}
