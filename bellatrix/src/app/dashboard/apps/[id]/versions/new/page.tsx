import AppVersionCreateView from "@/sections/app-versions/view/app-version-create-view";

type Props = {
  params: {
    id: string;
  };
};

export default function AppVersionCreatePage({ params }: Props) {
  return <AppVersionCreateView appId={params.id} />;
}
