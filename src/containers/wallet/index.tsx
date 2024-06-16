"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ActionBar from "@/components/wallet/ActionBar";
import TxRow from "@/components/wallet/TxRow";
import { useHash } from "@/hooks/hash";
import { useIsScrolled } from "@/hooks/scroll";
import { useAccount } from "@/state/account/actions";
import { useProfiles } from "@/state/profiles/actions";
import { Config, useSafeEffect } from "@citizenwallet/sdk";
import { Box, Flex } from "@radix-ui/themes";
import { QrCodeIcon } from "lucide-react";

interface WalletProps {
  config: Config;
}

export default function Wallet({ config }: WalletProps) {
  const { community, token } = config;

  const isScrolled = useIsScrolled();

  const [state, actions] = useAccount(config);
  const [profilesState, profilesActions] = useProfiles(config);

  const hash = useHash();

  useSafeEffect(() => {
    actions.openAccount(
      hash,
      (account) => {
        profilesActions.loadProfile(account);
      },
      (hash: string) => {
        const hashPath = `${hash}?alias=${community.alias}`;
        history.replaceState(null, "", `/#/wallet/${hashPath}`);
        window.location.hash = `#/wallet/${hashPath}`;
      }
    );
  }, [actions, hash, profilesActions, community]);

  const handleScan = () => {
    console.log("scan");
  };

  const account = state((state) => state.account);
  const profile = profilesState((state) => state.profiles[account]);

  console.log("account", account);

  return (
    <main className="flex min-h-screen w-full flex-col align-center p-4 max-w-xl">
      <Avatar className="z-20 fixed right-0 top-0 m-4 border-2 border-primary">
        <AvatarImage
          src={!profile ? "https://github.com/shadcn.png" : profile.image_small}
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

      <ActionBar small={isScrolled} community={community} token={token} />

      <Flex direction="column" className="w-full max-w-md" gap="3">
        {Array.from({ length: 100 }).map((_, index) => (
          <TxRow key={index} />
        ))}
      </Flex>

      <Box className="z-10 fixed bottom-0 left-0 w-full bg-transparent-from-white h-10 w-full"></Box>
    </main>
  );
}
