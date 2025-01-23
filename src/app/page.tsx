import Wallet from "@/containers/wallet";
import { readCommunityFile } from "@/services/config";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const config = readCommunityFile();

  if (!config) {
    return <div>Community not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Wallet config={config} />
    </Suspense>
  );
}