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

  async call(to: string, data: string, value?: string): Promise<string | null> {
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

    try {
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
    } catch (error) {
      console.error("Error calling", error);
      return null;
    }
  }
  /**
   * Waits for a transaction to be mined and returns whether it was successful
   * @param txHash - The transaction hash to wait for
   * @param options - Optional configuration for the transaction wait
   * @returns Promise resolving to boolean indicating transaction success
   */
  async waitForTransactionSuccess(
    txHash: string,
    options?: {
      timeout?: number; // Timeout in milliseconds
      confirmations?: number; // Number of confirmations to wait for
    }
  ): Promise<boolean> {
    if (!txHash || !txHash.startsWith("0x")) {
      console.error("Invalid transaction hash provided", txHash);
      return false;
    }

    try {
      // Set default options
      const confirmations = options?.confirmations || 1;
      const timeout = options?.timeout || 60000; // Default 60 seconds

      // Add timeout handling
      const receiptPromise = this.provider.waitForTransaction(
        txHash,
        confirmations,
        timeout
      );

      const receipt = await receiptPromise;

      if (!receipt) {
        console.warn(`No receipt returned for transaction ${txHash}`);
        return false;
      }

      // Explicitly handle all possible status values
      if (receipt.status === 1) {
        return true;
      } else if (receipt.status === 0) {
        console.warn(`Transaction ${txHash} failed with status 0`);
        return false;
      } else if (receipt.status === null || receipt.status === undefined) {
        console.warn(`Transaction ${txHash} has null/undefined status`);
        return false;
      }

      // Fallback for non-standard receipt status
      return Boolean(receipt.status);
    } catch (error) {
      // Provide more specific error handling
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          console.error(`Transaction ${txHash} timed out`);
        } else {
          console.error(
            `Error waiting for transaction ${txHash}:`,
            error.message
          );
        }
      } else {
        console.error(
          `Unknown error waiting for transaction ${txHash}:`,
          error
        );
      }
      return false;
    }
  }
}
