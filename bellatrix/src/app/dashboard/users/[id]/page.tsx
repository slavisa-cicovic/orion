import UserDetailsView from "@/sections/users/view/user-details-view";

type Props = {
  params: { id: string };
};

export default function UserDetailsPage({ params }: Props) {
  return <UserDetailsView userId={params.id} />;
}
