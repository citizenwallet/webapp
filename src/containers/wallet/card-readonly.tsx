"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CardBar from "@/components/wallet/CardBar";
import TxRow from "@/components/wallet/TxRow";
import { useThemeUpdater } from "@/hooks/theme";
import { useFocusEffect } from "@/hooks/useFocusEffect";
import { useScrollableWindowFetcher } from "@/hooks/useScrollableWindow";
import { getAvatarUrl } from "@/lib/utils";
import { useAccount } from "@/state/account/actions";
import { selectOrderedLogs } from "@/state/account/selectors";
import { useProfiles } from "@/state/profiles/actions";
import { getBaseUrl } from "@/utils/deeplink";
import { CommunityConfig, Config } from "@citizenwallet/sdk";
import { Flex } from "@radix-ui/themes";
import Link from "next/link";
import { useCallback, useEffect } from "react";
interface ContainerProps {
  config: Config;
  accountAddress: string;
  cardColor: string;
}

export default function ReadOnly({
  config,
  accountAddress,
  cardColor,
}: ContainerProps) {
  const { community } = config;

  const communityConfig = new CommunityConfig(config);

  const baseUrl = getBaseUrl();

  const [state, actions] = useAccount(baseUrl, config);
  const [profilesState, profilesActions] = useProfiles(config);

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
      {/* <Link
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
      </Link> */}

      <CardBar
        readonly
        cardColor={cardColor}
        profile={profile}
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
