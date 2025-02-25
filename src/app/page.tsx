import Wallet from "@/containers/wallet";
import { parseAliasFromDomain } from "@citizenwallet/sdk";
import { getCommunityFromHeaders } from "@/services/config";
import { headers } from "next/headers";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const headersList = await headers();

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return <div>Community not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Wallet config={config} />
    </Suspense>
  );
}
