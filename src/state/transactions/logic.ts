import { delay } from "@/utils/delay";
import { TransactionStore, Transaction, txType } from "./state";
import { useRef } from "react";

const mockTransactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
  id: `transaction${i + 1}`,
  name: `Transaction ${i + 1}`,
  description: `This is transaction ${i + 1}`,
  amount: Math.floor((Math.random() * 2 - 1) * 1000),
  date: new Date(),
  status: ["sending", "pending", "success", "failed"][
    Math.floor(Math.random() * 4)
  ] as txType,
}));

class TransactionLogic {
  constructor(private store: TransactionStore) {
    this.store = store;
  }

  fetchTransactions = async (address: string) => {
    try {
      this.store.fetchTransactionsRequest();

      console.log("address", address);

      await delay(1000);

      const txs: Transaction[] = mockTransactions;

      this.store.fetchTransactionsSuccess(txs);
    } catch (error) {
      console.log(error);

      this.store.fetchTransactionsFailure();
    }
  };
}

export const useTransactionLogic = (store: TransactionStore) => {
  const logicRef = useRef(new TransactionLogic(store));

  return logicRef.current;
};
