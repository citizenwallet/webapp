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
  signer?: Wallet | HDNodeWallet;

  constructor(config: Config, account: string, signer?: Wallet | HDNodeWallet) {
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

    if (!this.signer) {
      throw new Error("Signer not found");
    }

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

  async call(to: string, data: string, value?: string): Promise<string | null> {
    // Convert hex string to Uint8Array
    const dataBytes = data.startsWith("0x")
      ? new Uint8Array(Buffer.from(data.slice(2), "hex"))
      : new Uint8Array(Buffer.from(data, "hex"));

    if (!this.signer) {
      throw new Error("Signer not found");
    }

    try {
      const hash = await this.bundler.call(
        this.signer,
        to,
        this.account,
        dataBytes,
        BigInt(value ?? 0)
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
