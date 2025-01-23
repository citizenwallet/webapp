import { Core } from "@walletconnect/core";
import { WalletKit, IWalletKit } from "@reown/walletkit";
import { CommunityConfig, Config } from "@citizenwallet/sdk";
import { buildApprovedNamespaces } from "@walletconnect/utils";
import { ProposalTypes, SessionTypes, CoreTypes } from "@walletconnect/types";

export const SUPPORTED_METHODS = ["eth_sendTransaction", "personal_sign"];
export const SUPPORTED_EVENTS = ["accountsChanged", "chainChanged"];

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

      console.log("wallet kit", WalletKitService.walletKit?.name);
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
}

export default WalletKitService;
