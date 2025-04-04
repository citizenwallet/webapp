"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import WalletAction from "@/components/wallet/Action";
import ActionBar from "@/components/wallet/ActionBar";
import TxRow from "@/components/wallet/TxRow";
import ReceiveModal from "@/containers/wallet/ReceiveModal";
import { useHash } from "@/hooks/hash";
import { useIsScrolled } from "@/hooks/scroll";
import { useThemeUpdater } from "@/hooks/theme";
import { useFocusEffect } from "@/hooks/useFocusEffect";
import { useScrollableWindowFetcher } from "@/hooks/useScrollableWindow";
import { cn, getAvatarUrl } from "@/lib/utils";
import WalletKitService from "@/services/walletkit";
import { AccountLogic, useAccount } from "@/state/account/actions";
import { selectOrderedLogs } from "@/state/account/selectors";
import { useProfiles } from "@/state/profiles/actions";
import { useSend } from "@/state/send/actions";
import { useVoucher } from "@/state/voucher/actions";
import { getBaseUrl, getFullUrl } from "@/utils/deeplink";
import { getWindow } from "@/utils/window";
import {
  CommunityConfig,
  Config,
  QRFormat,
  getAccountBalance,
  parseQRFormat,
} from "@citizenwallet/sdk";
import { Box, Flex, Text } from "@radix-ui/themes";
import { ArrowDownIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect } from "react";
interface ContainerProps {
  config: Config;
  accountAddress: string;
}

export default function ReadOnly({ config, accountAddress }: ContainerProps) {
  const { community } = config;

  const communityConfig = new CommunityConfig(config);

  const isScrolled = useIsScrolled();

  const baseUrl = getBaseUrl();

  const [state, actions] = useAccount(baseUrl, config);
  const [_, sendActions] = useSend();
  const [profilesState, profilesActions] = useProfiles(config);
  const [voucherState, voucherActions] = useVoucher(config);
  const hash = useHash();

  const { toast } = useToast();

  useThemeUpdater(community);

  useEffect(() => {
    actions.getAccount(accountAddress);
  }, [accountAddress, actions]);

  const account = state((state) => state.account);

  useFocusEffect(() => {
    let unsubscribe: () => void | undefined;

    if (account) {
      profilesActions.loadProfile(account);
      actions.fetchBalance();
      unsubscribe = actions.listen(account);
    }

    return () => {
      unsubscribe?.();
    };
  }, [account]);

  const fetchMoreTransfers = useCallback(async () => {
    if (!account) return false;
    return actions.getTransfers(account);
  }, [actions, account]);

  const scrollableRef = useScrollableWindowFetcher(fetchMoreTransfers);

  const balance = state((state) => state.balance);
  const logs = state(selectOrderedLogs);
  const profile = profilesState((state) => state.profiles[account]);
  const profiles = profilesState((state) => state.profiles);

  return (
    <main
      ref={scrollableRef}
      className="relative flex min-h-screen w-full flex-col align-center p-4 max-w-xl"
    >
      <Link
        href={`/profile/${account}`}
        className="z-20 absolute right-0 top-0"
      >
        <Avatar className="h-11 w-11 m-4 border-2 border-primary">
          <AvatarImage
            src={getAvatarUrl(profile?.image_small, account)}
            alt="profile image"
          />
          <AvatarFallback>{!profile ? "PRF" : profile.username}</AvatarFallback>
        </Avatar>
      </Link>

      <ActionBar
        readonly
        account={account}
        balance={balance}
        config={config}
        accountActions={actions}
      />

      <Flex direction="column" className="w-full pt-[420px]" gap="3">
        {logs.map((tx) => (
          <TxRow
            key={tx.hash}
            token={communityConfig.primaryToken}
            community={community}
            account={account}
            tx={tx}
            actions={profilesActions}
            profiles={profiles}
          />
        ))}
      </Flex>
    </main>
  );
}
