import { generateReceiveLink, CommunityConfig } from "@citizenwallet/sdk";
import { ReceiveState } from "./state";

export const generateSelectReceiveDeepLink =
  (account: string, communityConfig: CommunityConfig) => (state: ReceiveState) => {
    return generateReceiveLink(
      state.baseUrl,
      communityConfig,
      account,
      state.amount,
      state.description
    );
  };
