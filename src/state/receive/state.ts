import { create } from "zustand";

export interface ReceiveState {
  link: string;
  amount: string;
  description: string;
  updateLink: (link: string) => void;
  updateAmount: (amount: string) => void;
  updateDescription: (description: string) => void;
  clear: () => void;
}

const initialState = () => ({
  link: "",
  amount: "",
  description: "",
});

export const useReceiveStore = create<ReceiveState>((set) => ({
  ...initialState(),
  updateLink: (link) => set((state) => ({ link })),
  updateAmount: (amount) => set((state) => ({ amount })),
  updateDescription: (description) => set((state) => ({ description })),
  clear: () => set(initialState()),
}));
