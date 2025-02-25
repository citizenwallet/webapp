"use client";

import QRScannerModal from "@/components/qr/QRScannerModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ActionBar from "@/components/wallet/ActionBar";
import TxRow from "@/components/wallet/TxRow";
import { useHash } from "@/hooks/hash";
import { useScrollableWindowFetcher } from "@/hooks/useScrollableWindow";
import { useAccount } from "@/state/account/actions";
import { selectOrderedLogs } from "@/state/account/selectors";
import { useProfiles } from "@/state/profiles/actions";
import { useSend } from "@/state/send/actions";
import { useVoucher } from "@/state/voucher/actions";
import {
  Config,
  CommunityConfig,
  QRFormat,
  parseQRFormat,
} from "@citizenwallet/sdk";
import { useFocusEffect } from "@/hooks/useFocusEffect";
import { Box, Flex } from "@radix-ui/themes";
import { QrCodeIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import VoucherModal from "./VoucherModal";
import { getFullUrl } from "@/utils/deeplink";
import { useIsScrolled } from "@/hooks/scroll";
import Link from "next/link";
import BackupModal from "./BackupModal";
import { getWindow } from "@/utils/window";
import { getAvatarUrl } from "@/lib/utils";
import { useThemeUpdater } from "@/hooks/theme";
import WalletKitService from "@/services/walletkit";
import WalletConnect from "@/containers/wallet_connect";
import { useToast } from "@/components/ui/use-toast";
import WalletKitProvider from "@/provider/wallet_kit";

interface ContainerProps {
  config: Config;
}

export default function Container({ config }: ContainerProps) {
  const { community } = config;
  const communityConfig = new CommunityConfig(config);

  const isScrolled = useIsScrolled();

  const [state, actions] = useAccount(config);
  const [_, sendActions] = useSend();
  const [profilesState, profilesActions] = useProfiles(config);
  const [voucherState, voucherActions] = useVoucher(config);
  const hash = useHash();

  const { toast } = useToast();

  const handleWalletConnect = useCallback(
    async (uri: string) => {
      const walletKit = WalletKitService.getWalletKit();
      if (!walletKit) {
        console.warn("WalletKit service not initialized");
        toast({
          title: "Connection unavailable",
          description: "Wallet service is not ready",
          variant: "warning",
        });
        return;
      }

      try {
        await walletKit.pair({ uri });
        toast({
          title: "Connected",
          variant: "success",
        });
      } catch (error) {
        console.error("WalletConnect pairing failed:", error);
        toast({
          title: "Connection failed",
          description: "Unable to connect to wallet",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleScan = useCallback(
    async (data: string) => {
      switch (parseQRFormat(data)) {
        case QRFormat.unsupported:
          return;
        case QRFormat.voucher:
          // handle vouchers
          const voucher = await voucherActions.readVoucher(data);

          if (voucher) {
            profilesActions.loadProfile(voucher.creator);
          }
          return;
        case QRFormat.walletConnectPairing:
          await handleWalletConnect(data);
          return;
        default:
          // something we can try to receive from
          sendActions.setModalOpen(true);

          const to = sendActions.parseQRCode(data);
          if (to) {
            profilesActions.loadProfile(to);
          }
          return;
      }
    },
    [sendActions, voucherActions, profilesActions, handleWalletConnect]
  );

  useThemeUpdater(community);

  useEffect(() => {
    // read the url first
    const href = getFullUrl();

    console.log("hash", hash);
    console.log("href", href);

    actions.openAccount(hash, (hashPath: string) => {
      history.replaceState(null, "", hashPath);
      const w = getWindow();
      if (w) {
        w.location.hash = hashPath;
      }

      handleScan(href);
    });
  }, [actions, hash, profilesActions, community, handleScan]);

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
      <BackupModal
        community={community}
        account={account}
        url={getWindow()?.location.href ?? "/"}
        className="z-20 absolute left-0 top-0"
      />

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

      <Flex
        justify="center"
        align="center"
        gap="2"
        className="z-20 fixed right-0 bottom-0 w-full mb-6"
      >
        <QRScannerModal onScan={handleScan}>
          <Button
            variant="ghost"
            className="h-20 w-20 rounded-full border-primary border-4 m-4 shadow-lg bg-white"
          >
            <QrCodeIcon size={40} className="text-primary" />
          </Button>
        </QRScannerModal>
      </Flex>

      <ActionBar
        account={account}
        balance={balance}
        small={isScrolled}
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

      <VoucherModal config={config} actions={voucherActions} />

      <Box className="z-10 fixed bottom-0 left-0 w-full bg-transparent-from-white h-10"></Box>
      <WalletKitProvider config={config}>
        <WalletConnect
          config={config}
          account={account}
          wallet={actions.account}
        />
      </WalletKitProvider>
    </main>
  );
}
