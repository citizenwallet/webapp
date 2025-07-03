import { ConfigCommunity } from "@citizenwallet/sdk";
import { useSafeEffect } from "@/hooks/useSafeEffect";

export const useThemeUpdater = (
  community?: ConfigCommunity,
  colorOverride?: string
) => {
  useSafeEffect(() => {
    if (community?.theme) {
      document.documentElement.style.setProperty(
        "--primary",
        colorOverride ?? community.theme.primary
      );
    }
  }, [community, colorOverride]);
};
