import Wallet from "@/layouts/wallet";
import { getConfig } from "@/services/config";

export default function Home() {
  const config = getConfig();

  return <Wallet config={config} />;
}
