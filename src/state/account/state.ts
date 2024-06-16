import { create } from "zustand";

export interface AccountState {
  account: string;
  owner: boolean;
  setAccount: (account: string) => void;
  setOwner: (owner: boolean) => void;
  clear: () => void;
}

const initialState = () => ({
  account: "",
  owner: false,
});

export const useAccountStore = create<AccountState>((set) => ({
  ...initialState(),
  setAccount: (account) => set((state) => ({ account })),
  setOwner: (owner) => set((state) => ({ owner })),
  clear: () => set(initialState()),
}));
