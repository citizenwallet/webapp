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
import { useCallback, useState } from "react";
import VoucherModal from "./VoucherModal";
import { generateAccountHashPath } from "@/utils/hash";
import { getFullUrl } from "@/utils/deeplink";
import { useIsScrolled } from "@/hooks/scroll";
import Link from "next/link";
import BackupModal from "./BackupModal";
import { getWindow } from "@/utils/window";
import { getAvatarUrl } from "@/lib/utils";
import { generateChallenge } from "@/services/passkeys/session";
import {
  getPasskeyFromRawId,
  loadPasskeysFromLocalStorage,
} from "@/lib/passkeys";
import { verifyAssertion } from "@/services/passkeys/challenge";
import Passkey from "@/components/passkeys/PassKey";
import { PasskeyArgType } from "@safe-global/protocol-kit";
import { BUNDLER_URL, CHAIN_NAME, RPC_URL } from "@/lib/constants";
import { Safe4337Pack } from "@safe-global/relay-kit";

interface ContainerProps {
  config: Config;
}

export default function Container({ config }: ContainerProps) {
  const { community, token } = config;

  const isScrolled = useIsScrolled();

  const [state, actions] = useAccount(config);
  const [_, sendActions] = useSend();
  const [profilesState, profilesActions] = useProfiles(config);
  const [voucherState, voucherActions] = useVoucher(config);
  const [selectedPasskey, setSelectedPasskey] = useState<PasskeyArgType>();
  const [safeAddress, setSafeAddress] = useState<string>();
  const [isSafeDeployed, setIsSafeDeployed] = useState<boolean>();
  const [userOp, setUserOp] = useState<string>();

  const [username, setUsername] = useState<string>("");
  const [signedMessage, setSignedMessage] = useState<string | null>(null);

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
  const transfers = state(selectOrderedTransfers);
  const profile = profilesState((state) => state.profiles[account]);
  const profiles = profilesState((state) => state.profiles);

  const selectPasskeySigner = async (rawId: string) => {
    console.log("selected passkey signer: ", rawId);

    const passkey = getPasskeyFromRawId(rawId);

    const safe4337Pack = await Safe4337Pack.init({
      provider: RPC_URL,
      signer: passkey,
      bundlerUrl: BUNDLER_URL,
      options: {
        owners: [],
        threshold: 1,
      },
    });

    const safeAddress = await safe4337Pack.protocolKit.getAddress();
    const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed();
    setSelectedPasskey(passkey);
    setSafeAddress(safeAddress);
    setIsSafeDeployed(isSafeDeployed);
  };

  const arrayBufferToBase64 = (buffer: any) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  };

  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async function signWithPasskey(challenge: any) {
    const passkeys = loadPasskeysFromLocalStorage();

    const options: any = {
      publicKey: {
        challenge: challenge,
        allowCredentials: [
          {
            id: base64ToArrayBuffer(passkeys[0].rawId),
            type: "public-key",
          },
        ],
        userVerification: "preferred", // or 'required' or 'discouraged'
      },
    };

    const assertion: any = await navigator.credentials.get(options);
    console.log("assertion---------------", assertion);
    try {
      const authData = assertion.response.authenticatorData;
      const clientDataJSON = assertion.response.clientDataJSON;
      const signature = assertion.response.signature;
      const userHandle = assertion.response.userHandle;

      return {
        id: assertion.id,
        rawId: arrayBufferToBase64(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: arrayBufferToBase64(authData),
          clientDataJSON: arrayBufferToBase64(clientDataJSON),
          signature: arrayBufferToBase64(signature),
          userHandle: userHandle ? arrayBufferToBase64(userHandle) : null,
        },
      };
    } catch (err) {
      console.error("Error getting assertion:", err);
    }
  }

  const handleSignMessage = async () => {
    const challenge = generateChallenge();
    const passkeys = loadPasskeysFromLocalStorage();
    signWithPasskey(challenge).then((assertion) => {
      const expectedChallenge = challenge;
      const expectedOrigin =
        "https://f55b-2001-569-5044-1900-9894-b6c2-2921-c540.ngrok-free.app";
      console.log("dddddd", selectedPasskey);
      const publicKey = passkeys[0].rawId;
      verifyAssertion(assertion, expectedChallenge, expectedOrigin, publicKey);
      // Send `assertion` to the server for verification
      console.log("Assertion:", assertion);
    });
  };

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
        balance={balance}
        small={isScrolled}
        config={config}
        accountActions={actions}
      />

      <Flex direction="column" className="w-full pt-[420px]" gap="3">
        {transfers.map((tx) => (
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

      <VoucherModal config={config} actions={voucherActions} />
      <h1>WebAuthn Sign Message</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <button onClick={handleSignMessage}>Sign Message</button>
      {signedMessage && <p>{signedMessage}</p>}
      <Passkey selectPasskeySigner={selectPasskeySigner} />
      <Box className="z-10 fixed bottom-0 left-0 w-full bg-transparent-from-white h-10 w-full"></Box>
    </main>
  );
}
