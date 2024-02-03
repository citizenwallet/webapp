import { create } from "zustand";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { devtools } from "zustand/middleware";

export type txType = "sending" | "pending" | "success" | "failed";

export interface TransactionType {
  id: string;
  name: string;
  description: string;
  amount: number;
  date: Date;
  status: txType;
}

export type AccountStateType = {
  loading: boolean;
  error: boolean;
  balance: bigint;
  transactions: TransactionType[];
  fetchBalanceRequest: () => void;
  fetchBalanceSuccess: (balance: bigint) => void;
  fetchBalanceFailure: () => void;
  fetchTransactionsRequest: () => void;
  fetchTransactionsSuccess: (transactions: TransactionType[]) => void;
  fetchTransactionsFailure: () => void;
};

export const useAccountState = create<AccountStateType>()(
  devtools((set) => ({
    balance: BigInt(0),
    transactions: [],
    loading: false,
    error: false,
    fetchBalanceRequest: () => set({ loading: true, error: false }),
    fetchBalanceSuccess: (balance: bigint) => set({ balance, loading: false, error: false }),
    fetchBalanceFailure() {
      set({ loading: false, error: true });
    },
    fetchTransactionsRequest: () => set({ loading: true, error: false }),
    fetchTransactionsSuccess: (transactions: TransactionType[]) =>
      set({ transactions, loading: false, error: false }),
    fetchTransactionsFailure: () => set({ loading: false, error: true }),
  }))
);
