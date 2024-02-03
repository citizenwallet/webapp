import { TransactionType } from "@/services/indexer";
import { create } from "zustand";

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

export const useAccountState = create<AccountStateType>()((set) => ({
  balance: BigInt(0),
  transactions: [],
  loading: false,
  error: false,
  fetchBalanceRequest: () => set({ loading: true, error: false }),
  fetchBalanceSuccess: (balance: bigint) =>
    set({ balance, loading: false, error: false }),
  fetchBalanceFailure() {
    set({ loading: false, error: true });
  },
  fetchTransactionsRequest: () => set({ loading: true, error: false }),
  fetchTransactionsSuccess: (transactions: TransactionType[]) =>
    set({ transactions, loading: false, error: false }),
  fetchTransactionsFailure: () => set({ loading: false, error: true }),
}));
