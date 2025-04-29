import { headers } from "next/headers";
import { getCommunityFromHeaders } from "@/services/config";
import PageClient from "./_components/page-client";
interface PageProps {
  params: Promise<{
    address: string;
  }>;
}

export default async function Page(props: PageProps) {
  const headersList = await headers();

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return <div>Community not found</div>;
  }

  const { address } = await props.params;

  return <PageClient config={config} address={address} />;
}
