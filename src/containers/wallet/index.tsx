"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ActionBar from "@/components/wallet/ActionBar";
import TxRow from "@/components/wallet/TxRow";
import { useHash } from "@/hooks/hash";
import { useIsScrolled } from "@/hooks/scroll";
import { useScrollableWindowFetcher } from "@/hooks/useScrollableWindow";
import { useAccount } from "@/state/account/actions";
import { selectOrderedTransfers } from "@/state/account/selectors";
import { useProfiles } from "@/state/profiles/actions";
import { Config, useSafeEffect } from "@citizenwallet/sdk";
import { Box, Flex } from "@radix-ui/themes";
import { QrCodeIcon } from "lucide-react";
import { useCallback } from "react";

interface WalletProps {
  config: Config;
}

export default function Wallet({ config }: WalletProps) {
  const { community } = config;

  // const isScrolled = useIsScrolled();
  const isScrolled = false;

  const [state, actions] = useAccount(config);
  const [profilesState, profilesActions] = useProfiles(config);

  const hash = useHash();

  useSafeEffect(() => {
    actions.openAccount(hash, (hash: string) => {
      const hashPath = `${hash}?alias=${community.alias}`;
      history.replaceState(null, "", `/#/wallet/${hashPath}`);
      window.location.hash = `#/wallet/${hashPath}`;
    });
  }, [actions, hash, profilesActions, community]);

  const account = state((state) => state.account);

  useSafeEffect(() => {
    console.log("rendering...", account);
  }, [actions, account]);

  useSafeEffect(() => {
    let unsubscribe: () => void | undefined;

    if (account) {
      profilesActions.loadProfile(account);
      actions.fetchBalance();
      // actions.getTransfers(account);
      unsubscribe = actions.listen(account);

      // actions.send("0xAB07F26A25c5269b05ca57eBB2be7720f1C1fE4E", "1");
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

  const handleScan = () => {
    console.log("scan");
  };

  const balance = state((state) => state.balance);
  const transfers = state(selectOrderedTransfers);
  const profile = profilesState((state) => state.profiles[account]);
  const profiles = profilesState((state) => state.profiles);

  return (
    <main
      ref={scrollableRef}
      className="flex min-h-screen w-full flex-col align-center p-4 max-w-xl"
    >
      <Avatar className="z-20 fixed right-0 top-0 m-4 border-2 border-primary">
        <AvatarImage
          src={!profile ? "/anonymous-user.svg" : profile.image_small}
          alt="profile image"
        />
        <AvatarFallback>{!profile ? "PRF" : profile.username}</AvatarFallback>
      </Avatar>

      <Flex
        justify="center"
        align="center"
        gap="2"
        className="z-20 fixed right-0 bottom-0 w-full mb-6"
      >
        <Button
          variant="ghost"
          onClick={handleScan}
          className="h-20 w-20 rounded-full border-primary border-4 m-4 shadow-lg bg-white"
        >
          <QrCodeIcon size={40} className="text-primary" />
        </Button>
      </Flex>

      <ActionBar
        balance={balance}
        small={isScrolled}
        config={config}
        accountActions={actions}
      />

      <Flex direction="column" className="w-full max-w-md" gap="3">
        {transfers.map((tx) => (
          <TxRow
            key={tx.hash}
            account={account}
            tx={tx}
            actions={profilesActions}
            profiles={profiles}
          />
        ))}
      </Flex>

      <Box className="z-10 fixed bottom-0 left-0 w-full bg-transparent-from-white h-10 w-full"></Box>
    </main>
  );
}
