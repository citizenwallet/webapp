import { create } from "zustand";

export interface SendState {
  modalOpen: boolean;
  to: string;
  resolvedTo: string | null;
  amount: string;
  description: string;
  setModalOpen: (modalOpen: boolean) => void;
  updateTo: (to: string) => void;
  updateAmount: (amount: string) => void;
  updateResolvedTo: (resolvedTo: string | null) => void;
  updateDescription: (description: string) => void;
  clear: () => void;
}

const initialState = () => ({
  modalOpen: false,
  to: "",
  resolvedTo: null,
  amount: "",
  description: "",
});

export const useSendStore = create<SendState>((set) => ({
  ...initialState(),
  setModalOpen: (modalOpen) => set((state) => ({ modalOpen })),
  updateTo: (to) => set((state) => ({ to })),
  updateAmount: (amount) => set((state) => ({ amount })),
  updateResolvedTo: (resolvedTo) => set((state) => ({ resolvedTo })),
  updateDescription: (description) => set((state) => ({ description })),
  clear: () =>
    set((state) => ({ ...initialState(), modalOpen: state.modalOpen })),
}));
