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
  parsePrivateKeyFromV4Hash,
} from "./urlAccount";

export class CWAccount {
  provider: JsonRpcProvider;
  bundler: BundlerService;

  config: Config;
  communityConfig: CommunityConfig;
  account: string;
  signer?: Wallet | HDNodeWallet;
  accountFactory?: string;

  constructor(
    config: Config,
    account: string,
    signer?: Wallet | HDNodeWallet,
    accountFactory?: string
  ) {
    this.communityConfig = new CommunityConfig(config);

    this.provider = new JsonRpcProvider(
      this.communityConfig.getRPCUrl(accountFactory)
    );

    this.bundler = new BundlerService(this.communityConfig, {
      accountFactoryAddress: accountFactory,
    });

    this.config = config;
    this.account = account;
    this.signer = signer;
    this.accountFactory = accountFactory;
  }

  static async random(config: Config, accountFactory?: string) {
    const wallet = Wallet.createRandom();

    const communityConfig = new CommunityConfig(config);
    const provider = new JsonRpcProvider(
      communityConfig.getRPCUrl(accountFactory)
    );

    const connectedWallet = wallet.connect(provider);

    const account = await getAccountAddress(
      communityConfig,
      connectedWallet.address
    );

    if (!account) {
      throw new Error("Failed to get account address");
    }

    return new CWAccount(config, account, wallet, accountFactory);
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
    let accountFactory: string | undefined;

    const version = encoded.split("-")[0];

    switch (version) {
      case "v4":
        [account, accountFactory, signer] = await parsePrivateKeyFromV4Hash(
          baseUrl,
          hash,
          walletPassword
        );
        break;

      case "v3":
        [account, signer] = await parsePrivateKeyFromHash(
          baseUrl,
          hash,
          walletPassword
        );
        break;

      case "v2":
        signer = await parseLegacyWalletFromHash(baseUrl, hash, walletPassword);
        if (!signer) {
          throw new Error("Invalid wallet format");
        }

        const communityConfig = new CommunityConfig(config);
        account =
          (await getAccountAddress(communityConfig, signer.address)) ||
          undefined;

        break;

      default:
        throw new Error("Invalid wallet format");
    }

    if (!account || !signer) {
      throw new Error("Invalid wallet format");
    }

    return new CWAccount(config, account, signer, accountFactory);
  }

  async getBalance() {
    return (await getAccountBalance(this.communityConfig, this.account)) ?? 0n;
  }

  async send(to: string, amount: string, description?: string) {
    const primaryToken = this.communityConfig.primaryToken;

    if (!this.signer) {
      throw new Error("Signer not found");
    }

    const hash = await this.bundler.sendERC20Token(
      this.signer,
      primaryToken.address,
      this.account,
      to,
      amount,
      description,
      this.accountFactory
    );

    return hash;
  }

  async call(to: string, data: string, value?: string) {
    // Convert hex string to Uint8Array
    const dataBytes = data.startsWith("0x")
      ? new Uint8Array(Buffer.from(data.slice(2), "hex"))
      : new Uint8Array(Buffer.from(data, "hex"));

    if (!this.signer) {
      throw new Error("Signer not found");
    }

    const hash = await this.bundler.call(
      this.signer,
      to,
      this.account,
      dataBytes,
      BigInt(value ?? 0),
      this.accountFactory
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
