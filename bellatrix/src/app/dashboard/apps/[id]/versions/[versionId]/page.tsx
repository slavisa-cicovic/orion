import AppVersionDetailsView from "@/sections/app-versions/view/app-version-details-view";

type Props = {
  params: {
    versionId: string;
  };
};

export default function AppVersionCreatePage({ params }: Props) {
  return <AppVersionDetailsView appVersionId={params.versionId} />;
}
