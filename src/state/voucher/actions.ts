import { StoreApi, UseBoundStore } from "zustand";
import { VoucherState, useVoucherStore } from "./state";
import { useMemo } from "react";
import {
  Config,
  ERC20ContractService,
  ProfileService,
  Voucher,
  decompress,
  parseVoucher,
} from "@citizenwallet/sdk";
import { BaseWallet, JsonRpcProvider, SigningKey, formatUnits } from "ethers";
import { BundlerService } from "@citizenwallet/sdk/dist/src/services/bundler";
import { formatAddress } from "@/utils/formatting";

export class VoucherActions {
  state: VoucherState;
  config: Config;

  signer?: BaseWallet;
  rpc: JsonRpcProvider;
  erc20: ERC20ContractService;

  profiles: ProfileService;
  bundler: BundlerService;
  constructor(state: VoucherState, config: Config) {
    this.state = state;
    this.config = config;

    this.rpc = new JsonRpcProvider(config.node.url);
    this.erc20 = new ERC20ContractService(
      config.token.address,
      config.node.ws_url,
      this.rpc
    );
    this.profiles = new ProfileService(config);
    this.bundler = new BundlerService(config);
  }

  setModalOpen(modalOpen: boolean) {
    this.state.setModalOpen(modalOpen);
  }

  async readVoucher(data: string): Promise<Voucher | null> {
    try {
      this.state.setModalOpen(true);
      this.state.voucherLoading();

      const { voucher, signer } = parseVoucher(data);

      const balance = await this.erc20.balanceOf(voucher.account);

      this.state.setBalance(formatUnits(balance, this.config.token.decimals));

      this.state.voucherLoaded(voucher);

      this.signer = signer.connect(this.rpc);

      return voucher;
    } catch (e) {
      console.error(e);
    }

    this.state.voucherError("Invalid voucher");
    return null;
  }

  async claimVoucher(to: string, voucher: Voucher): Promise<boolean> {
    try {
      if (!this.signer) {
        throw new Error("Invalid signer");
      }

      this.state.setClaiming(true);

      const balance = await this.erc20.balanceOf(voucher.account);
      const profile = await this.profiles.getProfile(voucher.creator);

      let description = `Claimed voucher from ${formatAddress(
        voucher.creator
      )}`;
      if (profile) {
        description = `Claimed voucher from ${profile.username}`;
      }

      this.bundler.sendERC20Token(
        this.signer,
        this.config.token.address,
        voucher.account,
        to,
        formatUnits(balance, this.config.token.decimals),
        description
      );

      this.state.setClaiming(false);
      this.setModalOpen(false);
      return true;
    } catch (e) {
      console.error(e);
    }

    this.state.setClaiming(false);
    return false;
  }

  clear() {
    this.state.clear();
    this.signer = undefined;
  }
}

export const useVoucher = (
  config: Config
): [UseBoundStore<StoreApi<VoucherState>>, VoucherActions] => {
  const store = useVoucherStore;
  const actions = useMemo(
    () => new VoucherActions(store.getState(), config),
    [store, config]
  );
  return [store, actions];
};
