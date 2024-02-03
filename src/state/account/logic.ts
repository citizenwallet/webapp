import { useRef } from "react";
import { ethers, JsonRpcProvider } from "ethers";
import { TransactionType, txType, AccountStateType, useAccountState } from "./state";
import { ConfigType } from "@/types/config";
import contractAbi from "smartcontracts/build/contracts/erc20/erc20.abi.json";

const mockTransactions: TransactionType[] = Array.from({ length: 20 }, (_, i) => ({
  id: `transaction${i + 1}`,
  name: `Transaction ${i + 1}`,
  description: `This is transaction ${i + 1}`,
  amount: Math.floor((Math.random() * 2 - 1) * 1000),
  date: new Date(),
  status: ["sending", "pending", "success", "failed"][
    Math.floor(Math.random() * 4)
  ] as txType,
}));

class AccountLogic {
  constructor(private state: AccountStateType, private config: ConfigType) {
    this.state = state;
    this.config = config;
  }

  fetchBalance = async (accountAddress: string) => {
    this.state.fetchBalanceRequest();
    try {
      if (!accountAddress) {
        throw new Error("Account address is required");
      }
      const provider = new JsonRpcProvider(this.config.node.url);
      const tokenContract = new ethers.Contract(this.config.token.address, contractAbi, provider);
      console.log(">>> this.config.token.address, contractAbi", this.config.token.address, contractAbi);
      console.log(">>> tokenContract", tokenContract);
      console.log(">>> accountAddress", accountAddress);
      const balance = await tokenContract.balanceOf(accountAddress);
      console.log("balance", balance);
      this.state.fetchBalanceSuccess(balance);
    } catch (e) {
      console.log(">>> error", e)
      this.state.fetchBalanceFailure();
    }
  };

  fetchTransactions = async (address: string) => {
    try {
      this.state.fetchTransactionsRequest();

      console.log("address", address);

      const txs: TransactionType[] = mockTransactions;

      this.state.fetchTransactionsSuccess(txs);
    } catch (error) {
      console.log(error);

      this.state.fetchTransactionsFailure();
    }
  };
}

export const useAccountLogic = (config: ConfigType) => {
  const state = useAccountState();
  const logicRef = useRef(new AccountLogic(state, config));
  return logicRef.current;
};
