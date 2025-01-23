import { WalletKitTypes } from "@reown/walletkit";
import { SessionTypes } from "@walletconnect/types";
import { create } from "zustand";



export interface WalletKitState {
  sessionProposal?: WalletKitTypes.SessionProposal;
  setSessionProposal: (sessionProposal: WalletKitTypes.SessionProposal) => void;

  activeSessions: Record<string, SessionTypes.Struct>;
  setActiveSessions: (sessions: Record<string, SessionTypes.Struct>) => void;

  clear: () => void;
}


const initialState = () => ({
    sessionProposal: undefined,
    activeSessions: {},
});


export const useWalletKitStore = create<WalletKitState>((set) => ({
    ...initialState(),
    setSessionProposal: (sessionProposal) => set((state) => ({ sessionProposal })),
    setActiveSessions: (sessions) => set((state) => ({ activeSessions: sessions })),
    clear: () => set(initialState()),
}));


