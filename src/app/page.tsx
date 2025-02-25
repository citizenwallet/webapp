import Wallet from "@/containers/wallet";
import { parseAliasFromDomain } from "@citizenwallet/sdk";
import { readCommunityFile } from "@/services/config";
import { headers } from "next/headers";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const headersList = await headers();
  const domain = headersList.get("host") || "";

  const alias = parseAliasFromDomain(
    domain,
    process.env.DOMAIN_BASE_PATH || ""
  );

  const config = readCommunityFile(alias);
  if (!config) {
    return <div>Community not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Wallet config={config} />
    </Suspense>
  );
}
