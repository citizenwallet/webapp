import { ConfigCommunity, useSafeEffect } from "@citizenwallet/sdk";

export const useThemeUpdater = (community?: ConfigCommunity) => {
  useSafeEffect(() => {
    if (community?.theme) {
      document.documentElement.style.setProperty(
        "--primary",
        community.theme.primary
      );
    }
  }, [community]);
};
