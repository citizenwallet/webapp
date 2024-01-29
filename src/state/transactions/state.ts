import { create } from "zustand";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { devtools } from "zustand/middleware";

export type txType = "sending" | "pending" | "success" | "failed";

export interface Transaction {
  id: string;
  name: string;
  description: string;
  amount: number;
  date: Date;
  status: txType;
}

export type TransactionStore = {
  transactions: Transaction[];
  loading: boolean;
  error: boolean;
  fetchTransactionsRequest: () => void;
  fetchTransactionsSuccess: (communities: Transaction[]) => void;
  fetchTransactionsFailure: () => void;
};

export const useTransactionStore = create<TransactionStore>()(
  devtools((set) => ({
    transactions: [],
    loading: false,
    error: false,
    fetchTransactionsRequest: () => set({ loading: true, error: false }),
    fetchTransactionsSuccess: (transactions: Transaction[]) =>
      set({ transactions, loading: false, error: false }),
    fetchTransactionsFailure: () => set({ loading: false, error: true }),
  }))
);
