import { Core } from "@walletconnect/core";
import { WalletKit, IWalletKit } from "@reown/walletkit";
import { CommunityConfig, Config } from "@citizenwallet/sdk";
import { buildApprovedNamespaces } from "@walletconnect/utils";

class WalletKitService {

  walletKit: IWalletKit | null = null;
  config: Config;
  communityConfig: CommunityConfig;
  account: string;

   constructor(config: Config, account: string) {
    this.config = config;
    this.communityConfig = new CommunityConfig(config);
    this.account = account;
    this.init(config);
  }

 



  async init(config: Config) {
    try {
      if (!process.env.NEXT_PUBLIC_REOWN_PROJECT_ID) {
        throw new Error("NEXT_PUBLIC_REOWN_PROJECT_ID is not set");
      }

      const core = new Core({
        projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
      });

      const { community: walletCommunity } = config;

      const walletMetadata = {
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

      this.walletKit = await WalletKit.init({
        core,
        metadata: walletMetadata,
      });
    } catch (e) {
      console.error("Error initializing WalletKit", e);
    }
  }

  buildNamespace(accountAddress: string) {
    const approvedNamespaces = buildApprovedNamespaces({
      proposal: data.proposal?.params as ProposalTypes.Struct,
      supportedNamespaces: {
        eip155: {
          chains: SUPPORTED_CHAINS,
          methods: SUPPORTED_METHODS,
          events: SUPPORTED_EVENTS,
          accounts: [`eip155:11155111:${accountAddress}`],
        },
      },
    });
  }
}

export default WalletKitService;
