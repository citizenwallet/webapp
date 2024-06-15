import { create } from "zustand";

export interface SendState {
  to: string;
  resolvedTo: string | null;
  amount: string;
  updateTo: (to: string) => void;
  updateAmount: (amount: string) => void;
  updateResolvedTo: (resolvedTo: string | null) => void;
  clear: () => void;
}

const initialState = () => ({
  to: "",
  resolvedTo: null,
  amount: "",
});

export const useSendStore = create<SendState>((set) => ({
  ...initialState(),
  updateTo: (to) => set((state) => ({ to })),
  updateAmount: (amount) => set((state) => ({ amount })),
  updateResolvedTo: (resolvedTo) => set((state) => ({ resolvedTo })),
  clear: () => set(initialState()),
}));
