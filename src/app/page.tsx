import Wallet from "@/containers/wallet";
import { getConfig } from "@/services/config";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const config = getConfig();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Wallet config={config} />
    </Suspense>
  );
}
