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
import { CommunityConfig, Config, ConfigToken } from "@citizenwallet/sdk";
import { Flex, Text } from "@radix-ui/themes";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
interface ContainerProps {
  config: Config;
  accountAddress: string;
  serialNumber: string;
  project?: string;
  cardColor: string;
  tokenAddress?: string;
}

export default function ReadOnly({
  config,
  accountAddress,
  serialNumber,
  project,
  cardColor,
  tokenAddress,
}: ContainerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const { community } = config;

  const communityConfig = useMemo(() => new CommunityConfig(config), [config]);

  const token = useMemo(
    () => communityConfig.getToken(tokenAddress),
    [communityConfig, tokenAddress]
  );

  console.log("token", token);

  const isScrolled = useIsScrolled();

  const baseUrl = getBaseUrl();

  const [state, actions] = useAccount(baseUrl, config);
  const [profilesState, profilesActions] = useProfiles(config);

  useThemeUpdater(community, cardColor);

  useEffect(() => {
    actions.getAccount(accountAddress);
  }, [accountAddress, actions]);

  const account = state((state) => state.account);

  useEffect(() => {
    (async () => {
      if (account) {
        console.log("fetching transfers", account, token.address);
        await actions.getTransfers(account, token.address, true);
        setLoading(false);
      }
    })();
  }, [account, actions, token.address]);

  useFocusEffect(() => {
    let unsubscribe: () => void | undefined;

    if (account) {
      console.log("fetching balance", account, token.address);
      profilesActions.loadProfile(account);
      actions.fetchBalance(token.address);
      unsubscribe = actions.listen(account, token.address);
    }

    return () => {
      unsubscribe?.();
    };
  }, [account, token.address]);

  const handleTokenChange = useCallback(
    (tokenAddress: string) => {
      let path = `/card/${serialNumber}`;
      if (project) {
        path += `?project=${project}`;
      }
      if (tokenAddress) {
        path += path.includes("?")
          ? `&token=${tokenAddress}`
          : `?token=${tokenAddress}`;
      }
      router.replace(path);
    },
    [serialNumber, project, router]
  );

  const fetchMoreTransfers = useCallback(async () => {
    if (!account) return false;
    return actions.getTransfers(account, token.address);
  }, [actions, account, token]);

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
        tokenAddress={token.address}
        onTokenChange={handleTokenChange}
      />

      <Flex direction="column" className="w-full pt-[440px]" gap="3">
        {!loading && logs.length === 0 && (
          <Flex
            justify="center"
            align="center"
            direction="column"
            className="w-full max-w-full py-4 active:bg-muted rounded-lg transition-colors duration-500 ease-in-out bg-white"
            gap="3"
          >
            <Image
              src="/coins.png"
              alt="card"
              width={140}
              height={140}
              className="pb-8"
            />
            <Text>No transactions yet</Text>
          </Flex>
        )}
        {loading && logs.length === 0 && (
          <Flex
            justify="center"
            align="center"
            direction="column"
            className="w-full max-w-full py-4 active:bg-muted rounded-lg transition-colors duration-500 ease-in-out bg-white"
            gap="3"
          >
            <Loader2 className="animate-spin" />
          </Flex>
        )}
        {logs.map((tx) => (
          <TxRow
            key={tx.hash}
            token={token}
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
