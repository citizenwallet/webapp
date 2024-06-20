import { generateReceiveLink } from "@/utils/deeplink";
import { ReceiveState } from "./state";

export const generateSelectReceiveDeepLink =
  (account: string, alias: string) => (state: ReceiveState) => {
    return generateReceiveLink(
      state.baseUrl,
      account,
      alias,
      state.amount,
      state.description
    );
  };
