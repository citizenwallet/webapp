"use client";

import { useEffect, useState } from "react";
import WalletKitService from "@/services/walletkit";
import { Config } from "@citizenwallet/sdk";

interface WalletKitProviderProps {
  config?: Config;
  children: React.ReactNode;
}

export default function WalletKitProvider({
  config,
  children,
}: WalletKitProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (config) {
      WalletKitService.createInstance(config).finally(() => {
        setReady(true);
      });
    }
  }, [config]);

  if (!ready) {
    return null;
  }

  return children;
}
