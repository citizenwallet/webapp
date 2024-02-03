import { create } from "zustand";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { devtools } from "zustand/middleware";

export type BootStateType = {
  loading: boolean;
  error: boolean;
  boot: () => void;
  bootSuccess: () => void;
  bootFailed: () => void;
};

export const useBootState = create<BootStateType>()(
  devtools((set) => ({
    loading: false,
    error: false,
    boot: () => set({ loading: true, error: false }),
    bootSuccess: () => set({ loading: false, error: false }),
    bootFailed: () => set({ loading: false, error: true }),
  }))
);
