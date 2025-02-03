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

class WalletKitService {
  private static instance: WalletKitService | null = null;
  private static walletKit: IWalletKit | null = null;
  private static config: Config;
  private static communityConfig: CommunityConfig;

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
}

export default WalletKitService;
