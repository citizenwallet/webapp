import { getCommunityFromHeaders } from "@/services/config";
import { headers } from "next/headers";
import CardReadOnly from "@/containers/wallet/card-readonly";
import { CommunityConfig, getCardAddress } from "@citizenwallet/sdk";
import { id } from "ethers";
import { ColorMappingOverrides } from "@/components/wallet/colorMappingOverrides";

interface PageProps {
  params: Promise<{
    serialNumber: string;
  }>;
  searchParams: Promise<{
    project?: string;
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
  const { project = "" } = await props.searchParams;

  const address = await getCardAddress(communityConfig, id(serialNumber));
  if (!address) {
    return <div>Card not found</div>;
  }

  const cardColor =
    ColorMappingOverrides[project] ??
    communityConfig.community.theme?.primary ??
    "#272727";

  return (
    <>
      <CardReadOnly
        config={config}
        accountAddress={address}
        cardColor={cardColor}
      />
    </>
  );
}
