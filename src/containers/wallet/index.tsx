"use client";

import QRScannerModal from "@/components/qr/QRScannerModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ActionBar from "@/components/wallet/ActionBar";
import TxRow from "@/components/wallet/TxRow";
import { useHash } from "@/hooks/hash";
import { useScrollableWindowFetcher } from "@/hooks/useScrollableWindow";
import { useAccount } from "@/state/account/actions";
import { selectOrderedTransfers } from "@/state/account/selectors";
import { useProfiles } from "@/state/profiles/actions";
import { useSend } from "@/state/send/actions";
import { useVoucher } from "@/state/voucher/actions";
import {
  Config,
  QRFormat,
  parseQRFormat,
  useSafeEffect,
  useFocusEffect,
} from "@citizenwallet/sdk";
import { Box, Flex } from "@radix-ui/themes";
import { QrCodeIcon } from "lucide-react";
import { useCallback } from "react";
import VoucherModal from "./VoucherModal";
import { generateAccountHashPath } from "@/utils/hash";
import { getFullUrl } from "@/utils/deeplink";
import { useIsScrolled } from "@/hooks/scroll";

interface WalletProps {
  config: Config;
}

export default function Wallet({ config }: WalletProps) {
  const { community } = config;

  // const isScrolled = useIsScrolled();
  const isScrolled = false;

  const [state, actions] = useAccount(config);
  const [_, sendActions] = useSend();
  const [profilesState, profilesActions] = useProfiles(config);
  const [voucherState, voucherActions] = useVoucher(config);

  const hash = useHash();

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
    [sendActions, voucherActions, profilesActions]
  );

  useSafeEffect(() => {
    // read the url first
    const href = getFullUrl();

    actions.openAccount(hash, (hash: string) => {
      const hashPath = generateAccountHashPath(hash, community.alias);
      history.replaceState(null, "", hashPath);
      window.location.hash = hashPath;

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

  const handleClaim = () => {
    actions.reclaimSignIn();
  };

  const handleRedirect = (link: string) => {
    actions.triggerLink(link);
  };

  const reclaimLink = state((state) => state.reclaimLink);

  const fetchMoreTransfers = useCallback(async () => {
    if (!account) return false;
    return actions.getTransfers(account);
  }, [actions, account]);

  const scrollableRef = useScrollableWindowFetcher(fetchMoreTransfers);

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
        balance={balance}
        small={isScrolled}
        config={config}
        accountActions={actions}
      />

      {transfers.length === 0 && !reclaimLink && (
        <Flex
          direction="column"
          justify="center"
          align="center"
          className="w-full h-40"
        >
          <Button onClick={handleClaim}>Request Proof</Button>
        </Flex>
      )}

      {transfers.length === 0 && reclaimLink && (
        <Flex
          direction="column"
          justify="center"
          align="center"
          className="w-full h-40"
        >
          <Button onClick={handleClaim}>Verify</Button>
        </Flex>
      )}

      <Flex direction="column" className="w-full" gap="3">
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

      <VoucherModal config={config} actions={voucherActions} />

      <Box className="z-10 fixed bottom-0 left-0 w-full bg-transparent-from-white h-10 w-full"></Box>
    </main>
  );
}
