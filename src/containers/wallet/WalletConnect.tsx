"use client";
import * as React from "react";
import { SignClientTypes } from "@walletconnect/types";
import WalletKitService from "@/services/walletkit";
import { useSafeEffect } from "@/hooks/useSafeEffect";

export default function WalletConnect() {
  

  const onSessionProposal = React.useCallback(
    async (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
      console.log("session_proposal", proposal);
    },
    []
  );

  useSafeEffect(() => {
    if (!walletKit) return;

    walletKit.on("session_proposal", onSessionProposal);

    return () => {
      walletKit.off("session_proposal", onSessionProposal);
    };
  }, [onSessionProposal, walletKit]);

  return <></>;
}
