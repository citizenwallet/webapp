import { StoreApi, UseBoundStore } from "zustand";
import { VoucherState, useVoucherStore } from "./state";
import { useMemo } from "react";
import {
  Config,
  CommunityConfig,
  BundlerService,
  Voucher,
  parseVoucher,
  getProfileFromAddress,
  getAccountBalance
} from "@citizenwallet/sdk";
import { BaseWallet, JsonRpcProvider, SigningKey, formatUnits } from "ethers";
import { formatAddress } from "@/utils/formatting";

export class VoucherActions {
  state: VoucherState;
  config: Config;
  communityConfig: CommunityConfig;

  signer?: BaseWallet;
  rpc: JsonRpcProvider;

  bundler: BundlerService;
  constructor(state: VoucherState, config: Config) {
    this.state = state;
    this.config = config;
    this.communityConfig = new CommunityConfig(config);

    this.rpc = new JsonRpcProvider(this.communityConfig.primaryRPCUrl);

    this.bundler = new BundlerService(this.communityConfig);
  }

  setModalOpen(modalOpen: boolean) {
    this.state.setModalOpen(modalOpen);
  }

  async readVoucher(data: string): Promise<Voucher | null> {
    try {
      this.state.setModalOpen(true);
      this.state.voucherLoading();

      const { voucher, signer } = parseVoucher(data);

      const balance = await getAccountBalance(this.communityConfig, voucher.account) ?? 0n;

      this.state.setBalance(formatUnits(balance, this.communityConfig.primaryToken.decimals));

      this.state.voucherLoaded(voucher);

      this.signer = signer.connect(this.rpc as any) as any;

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


      const balance = await getAccountBalance(this.communityConfig, voucher.account) ?? 0n;

      const profile = await getProfileFromAddress(this.config.ipfs.url, this.communityConfig, voucher.creator );

      let description = `Claimed voucher from ${formatAddress(
        voucher.creator
      )}`;
      if (profile) {
        description = `Claimed voucher from ${profile.username}`;
      }

      const primaryToken = this.communityConfig.primaryToken;

      this.bundler.sendERC20Token(
        this.signer as any,
        primaryToken.address,
        voucher.account,
        to,
        formatUnits(balance, primaryToken.decimals),
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
