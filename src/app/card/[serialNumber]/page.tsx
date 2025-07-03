import { getCommunityFromHeaders } from "@/services/config";
import { headers } from "next/headers";
import CardReadOnly from "@/containers/wallet/card-readonly";
import { CommunityConfig, getCardAddress } from "@citizenwallet/sdk";
import { id } from "ethers";
import { ColorMappingOverrides } from "@/components/wallet/colorMappingOverrides";
import { TokenMappingOverrides } from "@/components/wallet/tokenMappingOverrides";

interface PageProps {
  params: Promise<{
    serialNumber: string;
  }>;
  searchParams: Promise<{
    project?: string;
    community?: string; // mistake when ordering cards, it is = project
    token?: string;
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
  const { project = "", community = "", token } = await props.searchParams;

  const address = await getCardAddress(communityConfig, id(serialNumber));
  if (!address) {
    return <div>Card not found</div>;
  }

  const cardColor =
    ColorMappingOverrides[project ?? community] ??
    communityConfig.community.theme?.primary ??
    "#272727";

  const tokenAddress = token ?? TokenMappingOverrides[project ?? community];

  return (
    <>
      <CardReadOnly
        config={config}
        accountAddress={address}
        serialNumber={serialNumber}
        project={project ?? community}
        cardColor={cardColor}
        tokenAddress={tokenAddress}
      />
    </>
  );
}
