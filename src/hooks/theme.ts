import { ConfigCommunity } from "@citizenwallet/sdk";
import { useSafeEffect } from "@/hooks/useSafeEffect";

export const useThemeUpdater = (community?: ConfigCommunity) => {
  useSafeEffect(() => {
    if (community?.theme) {
      document.documentElement.style.setProperty(
        "--primary",
        community.theme.primary,
      );
    }
  }, [community]);
};
