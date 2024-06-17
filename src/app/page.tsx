import Wallet from "@/containers/wallet";
import { getConfig } from "@/services/config";

export const dynamic = "force-dynamic";

export default function Home() {
  const config = getConfig();

  return <Wallet config={config} />;
}
