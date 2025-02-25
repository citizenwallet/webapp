import {
  Config,
  CommunityConfig,
  BundlerService,
  getAccountBalance,
  getAccountAddress,
} from "@citizenwallet/sdk";
import { HDNodeWallet, JsonRpcProvider, Wallet } from "ethers";
import {
  parseLegacyWalletFromHash,
  parsePrivateKeyFromHash,
} from "./urlAccount";

export class CWAccount {
  provider: JsonRpcProvider;
  bundler: BundlerService;

  config: Config;
  communityConfig: CommunityConfig;
  account: string;
  signer: Wallet | HDNodeWallet;

  constructor(config: Config, account: string, signer: Wallet | HDNodeWallet) {
    this.communityConfig = new CommunityConfig(config);

    this.provider = new JsonRpcProvider(this.communityConfig.primaryRPCUrl);

    this.bundler = new BundlerService(this.communityConfig);

    this.config = config;
    this.account = account;
    this.signer = signer;
  }

  static async random(config: Config) {
    const wallet = Wallet.createRandom();

    const communityConfig = new CommunityConfig(config);
    const provider = new JsonRpcProvider(communityConfig.primaryRPCUrl);

    const connectedWallet = wallet.connect(provider);

    const account = await getAccountAddress(
      communityConfig,
      connectedWallet.address
    );

    if (!account) {
      throw new Error("Failed to get account address");
    }

    return new CWAccount(config, account, wallet);
  }

  static async fromHash(
    baseUrl: string,
    hash: string,
    walletPassword: string,
    config: Config
  ) {
    const [_, encoded] = hash.split("#/wallet/");

    let account: string | undefined;
    let signer: Wallet | HDNodeWallet | undefined;

    try {
      if (!encoded.startsWith("v3-")) {
        throw new Error("Invalid wallet format");
      }

      [account, signer] = await parsePrivateKeyFromHash(
        baseUrl,
        hash,
        walletPassword
      );

      if (!account || !signer) {
        throw new Error("Invalid wallet format");
      }
    } catch (error) {
      console.error(error);
      if (!encoded.startsWith("v2-")) {
        throw new Error("Invalid wallet format");
      }

      signer = await parseLegacyWalletFromHash(baseUrl, hash, walletPassword);
      if (!signer) {
        throw new Error("Invalid wallet format");
      }

      const communityConfig = new CommunityConfig(config);
      account =
        (await getAccountAddress(communityConfig, signer.address)) || undefined;
    }

    if (!account || !signer) {
      throw new Error("Invalid wallet format");
    }

    return new CWAccount(config, account, signer);
  }

  async getBalance() {
    return (await getAccountBalance(this.communityConfig, this.account)) ?? 0n;
  }

  async send(to: string, amount: string, description?: string) {
    const primaryToken = this.communityConfig.primaryToken;

    const hash = await this.bundler.sendERC20Token(
      this.signer,
      primaryToken.address,
      this.account,
      to,
      amount,
      description
    );

    return hash;
  }

  async call(to: string, data: string, value?: string) {
    // Convert hex string to Uint8Array
    const dataBytes = data.startsWith("0x")
      ? new Uint8Array(Buffer.from(data.slice(2), "hex"))
      : new Uint8Array(Buffer.from(data, "hex"));

    const hash = await this.bundler.call(
      this.signer,
      to,
      this.account,
      dataBytes,
      BigInt(value ?? 0)
    );

    return hash;
  }
  async waitForTransactionSuccess(txHash: string) {
    const receipt = await this.provider.waitForTransaction(txHash);
    if (receipt && receipt.status === 1) {
      return true;
    }

    return false;
  }
}
