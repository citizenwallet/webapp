import { useMemo } from "react";
import { AccountState, useAccountStore } from "./state";
import { StoreApi, UseBoundStore } from "zustand";
import { Config } from "@citizenwallet/sdk";
import { CWAccount } from "@/services/account";
import { generateWalletHash } from "@/services/account/urlAccount";

class SendLogic {
  state: AccountState;
  config: Config;

  account?: CWAccount;
  constructor(state: AccountState, config: Config) {
    this.state = state;
    this.config = config;
  }

  async openAccount(
    url: string,
    openAccountCallback: (account: string) => void,
    createAccountCallback: (hash: string) => void
  ) {
    console.log(url);
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

      openAccountCallback(this.account.account);

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
