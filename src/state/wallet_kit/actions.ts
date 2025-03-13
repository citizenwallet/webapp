import { WalletKitState, useWalletKitStore } from "./state";
import { StoreApi, UseBoundStore } from "zustand";
import { useMemo } from "react";
import { SessionTypes } from "@walletconnect/types";

export class WalletKitLogic {
  state: WalletKitState;
  constructor(state: WalletKitState) {
    this.state = state;
  }

  setActiveSessions(sessions: Record<string, SessionTypes.Struct>) {
    this.state.setActiveSessions(sessions);
  }
    
  getActiveSessions() {
    return this.state.activeSessions;
  }

  clear() {
    this.state.clear();
  }
}

export const useWalletKit = (): [
  UseBoundStore<StoreApi<WalletKitState>>,
  WalletKitLogic
] => {
  const walletKitStore = useWalletKitStore;

  const actions = useMemo(
    () => new WalletKitLogic(walletKitStore.getState()),
    [walletKitStore]
  );

  return [walletKitStore, actions];
};
