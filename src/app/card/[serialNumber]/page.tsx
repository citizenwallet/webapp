import { getCommunityFromHeaders } from "@/services/config";
import { headers } from "next/headers";
import ReadOnly from "@/containers/wallet/readonly";
import { CommunityConfig, getCardAddress } from "@citizenwallet/sdk";
import { id } from "ethers";

interface PageProps {
  params: Promise<{
    serialNumber: string;
  }>;
}

export default async function Page(props: PageProps) {
  const headersList = await headers();

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return <div>Community not found</div>;
  }

  const communityConfig = new CommunityConfig(config);

  const { serialNumber } = await props.params;

  const address = await getCardAddress(communityConfig, id(serialNumber));
  if (!address) {
    return <div>Card not found</div>;
  }

  return (
    <>
      <ReadOnly config={config} accountAddress={address} />
    </>
  );
}
