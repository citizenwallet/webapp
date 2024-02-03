import { TransactionType } from "@/services/indexer"
import { create } from "zustand"

export type AccountStateType = {
  loading: boolean
  error: boolean
  balance: bigint
  transactions: TransactionType[]
  txSendLoading: boolean
  txSendError: boolean
  txSendTransaction: TransactionType | undefined
  fetchBalanceRequest: () => void
  fetchBalanceSuccess: (balance: bigint) => void
  fetchBalanceFailure: () => void
  fetchTransactionsRequest: () => void
  fetchTransactionsSuccess: (transactions: TransactionType[]) => void
  fetchTransactionsFailure: () => void
  addNewTransactions: (transactions: TransactionType[]) => void
  txSendRequest: () => void
  txSendSuccess: (transaction: TransactionType) => void
  txSendFailure: () => void
  clearTxSend: () => void
}

export const useAccountState = create<AccountStateType>()((set) => ({
  balance: BigInt(0),
  transactions: [],
  loading: false,
  error: false,
  txSendLoading: false,
  txSendError: false,
  txSendTransaction: undefined,
  fetchBalanceRequest: () => set({ loading: true, error: false }),
  fetchBalanceSuccess: (balance: bigint) =>
    set({ balance, loading: false, error: false }),
  fetchBalanceFailure() {
    set({ loading: false, error: true })
  },
  fetchTransactionsRequest: () => set({ loading: true, error: false }),
  fetchTransactionsSuccess: (transactions: TransactionType[]) =>
    set({ transactions, loading: false, error: false }),
  fetchTransactionsFailure: () => set({ loading: false, error: true }),
  addNewTransactions: (transactions: TransactionType[]) => {
    set((state) => ({
      transactions: [...transactions, ...state.transactions],
    }))
  },
  txSendRequest: () =>
    set({
      txSendLoading: true,
      txSendError: false,
    }),
  txSendSuccess: (transaction: TransactionType) =>
    set({
      txSendTransaction: transaction,
      txSendLoading: false,
      txSendError: false,
    }),
  txSendFailure: () =>
    set({
      txSendLoading: false,
      txSendError: true,
    }),
  clearTxSend: () =>
    set({
      txSendLoading: false,
      txSendError: false,
      txSendTransaction: undefined,
    }),
}))
