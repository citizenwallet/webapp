import { useMemo } from "react";
import { AccountState, useAccountStore } from "./state";
import { StoreApi, UseBoundStore } from "zustand";
import { Config, IndexerService } from "@citizenwallet/sdk";
import { CWAccount } from "@/services/account";
import { generateWalletHash } from "@/services/account/urlAccount";
import { formatUnits } from "ethers";

class SendLogic {
  state: AccountState;
  config: Config;

  indexer: IndexerService;

  account?: CWAccount;
  constructor(state: AccountState, config: Config) {
    this.state = state;
    this.config = config;

    this.indexer = new IndexerService(config.indexer);
  }

  async openAccount(
    url: string,
    createAccountCallback: (hash: string) => void
  ) {
    if (!url) {
      this.createAccount(createAccountCallback);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
      if (!baseUrl) {
        throw new Error("Base URL not set");
      }

      const walletPassword = process.env.NEXT_PUBLIC_WEB_BURNER_PASSWORD;
      if (!walletPassword) {
        throw new Error("Wallet password not set");
      }

      this.account = await CWAccount.fromHash(
        baseUrl,
        url,
        walletPassword,
        this.config
      );
      if (!this.account) {
        throw new Error("Invalid wallet format");
      }

      this.state.setAccount(this.account.account);
      this.state.setOwner(true);
    } catch (e) {
      console.error(e);
    }
  }

  async createAccount(createAccountCallback: (hash: string) => void) {
    try {
      this.account = await CWAccount.random(this.config);

      const walletPassword = process.env.NEXT_PUBLIC_WEB_BURNER_PASSWORD;
      if (!walletPassword) {
        throw new Error("Wallet password not set");
      }

      const hash = await generateWalletHash(
        this.account.account,
        this.account.signer,
        walletPassword
      );

      createAccountCallback(hash);
    } catch (e) {
      console.error(e);
    }
  }

  async fetchBalance() {
    try {
      if (!this.account) {
        throw new Error("Account not set");
      }

      const balance = await this.account.getBalance();

      const formattedBalance = formatUnits(balance, this.config.token.decimals);

      this.state.setBalance(formattedBalance);
    } catch (error) {}
  }

  private listenerInterval: ReturnType<typeof setInterval> | undefined;
  private listenMaxDate = new Date();
  private listenerFetchLimit = 10;

  listen(account: string) {
    try {
      this.listenerInterval = setInterval(async () => {
        const params = {
          fromDate: this.listenMaxDate.toISOString(),
          limit: this.listenerFetchLimit,
          offset: 0,
        };

        const { array: transfers = [] } = await this.indexer.getNewTransfers(
          this.config.token.address,
          account,
          params
        );

        if (transfers.length > 0) {
          // new items, move the max date to the latest one
          this.listenMaxDate = new Date();
        }

        if (transfers.length === 0) {
          // nothing new to add
          return;
        }

        this.fetchBalance();

        // new items, add them to the store
        this.state.putTransfers(transfers);
      }, 1000);

      return () => {
        clearInterval(this.listenerInterval);
      };
    } catch (_) {}
    return () => {};
  }

  async fetchInitialTransfers(account: string) {
    try {
      const params = {
        maxDate: new Date("10/06/2024").toISOString(),
        limit: 10,
        offset: 0,
      };

      const { array: transfers } = await this.indexer.getTransfers(
        this.config.token.address,
        account,
        params
      );

      this.state.putTransfers(transfers);
    } catch (error) {}
  }

  async send(to: string, amount: string) {
    try {
      if (!this.account) {
        throw new Error("Account not set");
      }

      const tx = await this.account.send(to, amount);

      //   this.fetchBalance();
      //   this.state.putTransfers([tx]);
    } catch (error) {}
  }

  clear() {
    this.state.clear();
  }
}

export const useAccount = (
  config: Config
): [UseBoundStore<StoreApi<AccountState>>, SendLogic] => {
  const sendStore = useAccountStore;

  const actions = useMemo(
    () => new SendLogic(sendStore.getState(), config),
    [sendStore, config]
  );

  return [sendStore, actions];
};
