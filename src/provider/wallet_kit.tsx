"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    if (config) {
      WalletKitService.createInstance(config);
    }
  }, [config]);

  return children;
}
