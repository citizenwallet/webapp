import { Core } from "@walletconnect/core";
import { WalletKit, IWalletKit } from "@reown/walletkit";
import { CommunityConfig, Config } from "@citizenwallet/sdk";
import {
  buildApprovedNamespaces,
  populateAuthPayload as WC_populateAuthPayload,
} from "@walletconnect/utils";
import {
  ProposalTypes,
  SessionTypes,
  CoreTypes,
  AuthTypes,
} from "@walletconnect/types";

export const SUPPORTED_METHODS = [
  "eth_accounts",
  "eth_requestAccounts",
  "eth_sendRawTransaction",
  "eth_sign",
  "eth_signTransaction",
  "eth_signTypedData",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
  "eth_sendTransaction",
  "personal_sign",
  "wallet_switchEthereumChain",
  "wallet_addEthereumChain",
  "wallet_getPermissions",
  "wallet_requestPermissions",
  "wallet_registerOnboarding",
  "wallet_watchAsset",
  "wallet_scanQRCode",
  "wallet_sendCalls",
  "wallet_getCallsStatus",
  "wallet_showCallsStatus",
  "wallet_getCapabilities",
];
export const SUPPORTED_EVENTS = [
  "chainChanged",
  "accountsChanged",
  "message",
  "disconnect",
  "connect",
];

export interface ContractData {
  SourceCode: string;
  ABI: string;
  ContractName: string;
  CompilerVersion: string;
  OptimizationUsed: string;
  Runs: string;
  ConstructorArguments: string;
  EVMVersion: string;
  Library: string;
  LicenseType: string;
  Proxy: string;
  Implementation: string;
  SwarmSource: string;
}

class WalletKitService {
  private static instance: WalletKitService | null = null;
  private static walletKit: IWalletKit | null = null;
  private static config: Config;
  static communityConfig: CommunityConfig;

  static async createInstance(config: Config): Promise<void> {
    if (WalletKitService.instance) return;

    WalletKitService.config = config;
    WalletKitService.communityConfig = new CommunityConfig(config);

    try {
      if (!process.env.NEXT_PUBLIC_REOWN_PROJECT_ID) {
        throw new Error("NEXT_PUBLIC_REOWN_PROJECT_ID is not set");
      }

      const core = new Core({
        projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
      });

      const { community: walletCommunity } = config;

      const walletMetadata: CoreTypes.Metadata = {
        name: walletCommunity.name,
        description: walletCommunity.description,
        url: walletCommunity.url,
        icons: [walletCommunity.logo],
        verifyUrl: undefined,
        redirect: {
          native: undefined,
          universal: undefined,
          linkMode: false,
        },
      };

      WalletKitService.walletKit = await WalletKit.init({
        core,
        metadata: walletMetadata,
      });
    } catch (e) {
      console.error("Error creating WalletKitService instance", e);
    }
  }

  static getWalletKit(): IWalletKit | null {
    return WalletKitService.walletKit;
  }

  static buildNamespaces(
    proposal: ProposalTypes.Struct,
    account: string
  ): SessionTypes.Namespaces {
    const chainId = WalletKitService.communityConfig.primaryToken.chain_id;

    const approvedNamespaces = buildApprovedNamespaces({
      proposal: proposal,
      supportedNamespaces: {
        eip155: {
          chains: [`eip155:${chainId}`],
          methods: SUPPORTED_METHODS,
          events: SUPPORTED_EVENTS,
          accounts: [`eip155:${chainId}:${account}`],
        },
      },
    });

    return approvedNamespaces;
  }

  static populateAuthPayload(
    payloadParams: AuthTypes.PayloadParams,
    account: string
  ) {
    if (!WalletKitService.walletKit) return;
    const chainId = WalletKitService.communityConfig.primaryToken.chain_id;
    const supportedChains = [`eip155:${chainId}`];

    const authPayload = WC_populateAuthPayload({
      authPayload: payloadParams,
      chains: supportedChains,
      methods: SUPPORTED_METHODS,
    });

    const iss = `eip155:${chainId}:${account}`;

    const message = WalletKitService.walletKit.formatAuthMessage({
      request: authPayload,
      iss,
    });

    return message;
  }

  static async getContractDetails(
    address: string
  ): Promise<null | ContractData> {

    const explorerApi = "https://api.gnosisscan.io/api"; // TODO: add to community.json file

    const response = await fetch(
      `${explorerApi}?module=contract&action=getsourcecode&address=${address}&apikey=${process.env.NEXT_PUBLIC_GNOSIS_SCAN_API_KEY}`
    );
    const data = await response.json();

    if (
      data.status !== "1" ||
      data.message !== "OK" ||
      data.result.length === 0 ||
      !data.result[0].ContractName
    ) {
      console.error("Failed to fetch contract details:", data.message);
      return null;
    }

    const result = data.result[0];

    return {
      SourceCode: result.SourceCode,
      ABI: result.ABI,
      ContractName: result.ContractName,
      CompilerVersion: result.CompilerVersion,
      OptimizationUsed: result.OptimizationUsed,
      Runs: result.Runs,
      ConstructorArguments: result.ConstructorArguments,
      EVMVersion: result.EVMVersion,
      Library: result.Library,
      LicenseType: result.LicenseType,
      Proxy: result.Proxy,
      Implementation: result.Implementation,
      SwarmSource: result.SwarmSource,
    };
  }
}

export default WalletKitService;
