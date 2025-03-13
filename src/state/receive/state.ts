import { create } from "zustand";

export interface ReceiveState {
  baseUrl: string;
  amount: string;
  description: string;
  updateAmount: (amount: string) => void;
  updateDescription: (description: string) => void;
  clear: () => void;
}

const initialState = () => ({
  baseUrl: `https://${process.env.NEXT_PUBLIC_DEEPLINK_DOMAIN || ""}`,
  amount: "",
  description: "",
});

export const useReceiveStore = create<ReceiveState>((set) => ({
  ...initialState(),
  updateAmount: (amount) => set((state) => ({ amount })),
  updateDescription: (description) => set((state) => ({ description })),
  clear: () => set(initialState()),
}));
