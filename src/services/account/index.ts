import { generateAccountHashPath } from "@/utils/hash";
import {
  BundlerService,
  CommunityConfig,
  Config,
  getAccountAddress,
  getAccountBalance,
} from "@citizenwallet/sdk";
import { HDNodeWallet, JsonRpcProvider, Wallet } from "ethers";
import {
  generateWalletHashV3,
  generateWalletHashV4FromV3,
  parseLegacyWalletFromHash,
  parsePrivateKeyFromHash,
  parsePrivateKeyFromV4Hash,
} from "./urlAccount";

export class CWAccount {
  provider: JsonRpcProvider;

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

    const communityConfig = new CommunityConfig(config);

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

        if (!account || !signer) {
          throw new Error("Invalid wallet format");
        }

        const hashV4 = await generateWalletHashV4FromV3(
          account,
          communityConfig,
          signer,
          walletPassword
        );

        const hashV4Path = generateAccountHashPath(
          hashV4,
          config.community.alias
        );

        window.location.href = window.location.origin + "/" + hashV4Path;
        window.location.reload();

        break;

      case "v2":
        signer = await parseLegacyWalletFromHash(baseUrl, hash, walletPassword);
        if (!signer) {
          throw new Error("Invalid wallet format");
        }

        account =
          (await getAccountAddress(communityConfig, signer.address)) ||
          undefined;

        if (!account || !signer) {
          throw new Error("Invalid wallet format");
        }

        const hashV3 = await generateWalletHashV3(
          account,
          signer,
          walletPassword
        );

        const hashV3Path = generateAccountHashPath(
          hashV3,
          config.community.alias
        );

        window.location.href = window.location.origin + "/" + hashV3Path;
        window.location.reload();

        break;

      default:
        throw new Error("Invalid wallet format");
    }

    if (!account || !signer) {
      throw new Error("Invalid wallet format");
    }

    return new CWAccount(config, account, signer, accountFactory);
  }

  async getBalance(token: string) {
    return (
      (await getAccountBalance(this.communityConfig, this.account, {
        accountFactoryAddress: this.accountFactory,
        tokenAddress: token,
      })) ?? 0n
    );
  }

  async send(token: string, to: string, amount: string, description?: string) {
    if (!this.signer) {
      throw new Error("Signer not found");
    }

    const bundler = new BundlerService(this.communityConfig, {
      accountFactoryAddress: this.accountFactory,
    });

    const hash = await bundler.sendERC20Token(
      this.signer,
      token,
      this.account,
      to,
      amount,
      description,
      { accountFactoryAddress: this.accountFactory }
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

    const bundler = new BundlerService(this.communityConfig, {
      accountFactoryAddress: this.accountFactory,
    });

    const hash = await bundler.call(
      this.signer,
      to,
      this.account,
      dataBytes,
      BigInt(value ?? 0),
      undefined,
      undefined,
      { accountFactoryAddress: this.accountFactory }
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
