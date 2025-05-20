"use client";

import CardBar from "@/components/wallet/CardBar";
import TxRow from "@/components/wallet/TxRow";
import { useIsScrolled } from "@/hooks/scroll";
import { useThemeUpdater } from "@/hooks/theme";
import { useFocusEffect } from "@/hooks/useFocusEffect";
import { useScrollableWindowFetcher } from "@/hooks/useScrollableWindow";
import { useAccount } from "@/state/account/actions";
import { selectOrderedLogs } from "@/state/account/selectors";
import { useProfiles } from "@/state/profiles/actions";
import { getBaseUrl } from "@/utils/deeplink";
import { CommunityConfig, Config } from "@citizenwallet/sdk";
import { Flex, Text } from "@radix-ui/themes";
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

  const isScrolled = useIsScrolled();

  const baseUrl = getBaseUrl();

  const [state, actions] = useAccount(baseUrl, config);
  const [profilesState, profilesActions] = useProfiles(config);

  useThemeUpdater(community);

  useEffect(() => {
    actions.getAccount(accountAddress);
  }, [accountAddress, actions]);

  const account = state((state) => state.account);

  useEffect(() => {
    if (account) {
      actions.getTransfers(account);
    }
  }, [account, actions]);

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
        small={isScrolled}
        cardColor={cardColor}
        profile={profile}
        account={account}
        balance={balance}
        config={config}
        accountActions={actions}
      />

      <Flex direction="column" className="w-full pt-[440px]" gap="3">
        {logs.length === 0 && (
          <Flex
            justify="center"
            align="center"
            direction="column"
            className="w-full max-w-full py-4 active:bg-muted rounded-lg transition-colors duration-500 ease-in-out bg-white"
            gap="3"
          >
            <Text>This is your card</Text>
            <Text>You can already top it up</Text>
            <Text>Spending is coming soon</Text>
          </Flex>
        )}
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
