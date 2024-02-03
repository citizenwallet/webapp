import { useRef } from "react";
import { ethers, JsonRpcProvider } from "ethers";
import { AccountStateType, useAccountState } from "./state";
import { ConfigType } from "@/types/config";
import contractAbi from "smartcontracts/build/contracts/erc20/erc20.abi.json";
import {
  FetchTransactionsQueryParams,
  IndexerService,
} from "@/services/indexer";
import { ApiService } from "@/services/api";

class AccountLogic {
  private indexer: IndexerService;

  constructor(private state: AccountStateType, private config: ConfigType) {
    this.state = state;
    this.config = config;

    const api = new ApiService(this.config.indexer.url);
    this.indexer = new IndexerService(api, this.config.token.address);
  }

  fetchBalance = async (accountAddress: string) => {
    this.state.fetchBalanceRequest();
    try {
      if (!accountAddress) {
        throw new Error("Account address is required");
      }
      const provider = new JsonRpcProvider(this.config.node.url);
      const tokenContract = new ethers.Contract(
        this.config.token.address,
        contractAbi,
        provider
      );

      const balance = await tokenContract.balanceOf(accountAddress);

      this.state.fetchBalanceSuccess(balance);
    } catch (e) {
      this.state.fetchBalanceFailure();
    }
  };

  fetchTransactions = async (
    address: string,
    params?: FetchTransactionsQueryParams
  ) => {
    try {
      this.state.fetchTransactionsRequest();

      const txs = await this.indexer.fetchTransactions(address, params);

      this.state.fetchTransactionsSuccess(txs);
    } catch (error) {
      this.state.fetchTransactionsFailure();
    }
  };

  cancel?: () => void;

  startListeningForTransactions = async (address: string) => {
    try {
      this.cancel = this.indexer.listenForNewTransactions(address, (txs) =>
        this.state.addNewTransactions(txs)
      );
    } catch (error) {
      console.error("Error listening for transactions", error);
    }
  };

  stopListeningForTransactions = () => {
    this.cancel?.();

    this.cancel = undefined;
  };
}

export const useAccountLogic = (config: ConfigType) => {
  const state = useAccountState();
  const logicRef = useRef(new AccountLogic(state, config));
  return logicRef.current;
};
