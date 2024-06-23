import { Profile, Voucher } from "@citizenwallet/sdk";
import { create } from "zustand";

export interface VoucherState {
  modalOpen: boolean;
  loading: boolean;
  voucher: Voucher | null;
  balance: string;
  claiming: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  voucherLoading: () => void;
  voucherLoaded: (voucher: Voucher) => void;
  voucherError: (error: string) => void;
  setBalance: (balance: string) => void;
  setClaiming: (claiming: boolean) => void;
  clear: () => void;
}

const initialState = () => ({
  modalOpen: false,
  loading: false,
  voucher: null,
  balance: "0",
  claiming: false,
});

export const useVoucherStore = create<VoucherState>((set) => ({
  ...initialState(),
  setModalOpen: (modalOpen) => set({ modalOpen }),
  voucherLoading: () => set({ loading: true }),
  voucherLoaded: (voucher) => set({ loading: false, voucher }),
  voucherError: (error) => ({ loading: false }),
  setBalance: (balance) => set({ balance }),
  setClaiming: (claiming) => set({ claiming }),
  clear: () =>
    set((state) => ({ ...initialState(), modalOpen: state.modalOpen })),
}));
