"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import WalletAction from "@/components/wallet/Action";
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
    CommunityConfig, Config, QRFormat,
    getAccountBalance,
    parseQRFormat
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



            {/* Action Bar */}
            <Flex
                direction="column"
                className="fixed top-0 w-full max-w-xl items-center justify-between text-sm pr-4"
            >
                {!isScrolled && (
                    <Flex
                        justify="center"
                        align="center"
                        gap="2"
                        className="w-full bg-white pt-4 pr-4"
                    >
                        <Avatar className="h-28 w-28">
                            <AvatarImage src={community.logo} alt="community logo" />
                            <AvatarFallback>{communityConfig.primaryToken.symbol}</AvatarFallback>
                        </Avatar>
                    </Flex>
                )}

                {!isScrolled && (
                    <Flex
                        justify="center"
                        align="center"
                        gap="2"
                        className="w-full bg-white pt-4 pr-4"
                    >
                        <Text size="6" weight="bold" className="text-muted-strong">
                            {community.name}
                        </Text>
                    </Flex>
                )}

                {!isScrolled && (
                    <Flex
                        justify="center"
                        align="center"
                        gap="2"
                        className="w-full bg-white pt-4 pr-4"
                    >
                        <Text size="9" weight="bold">
                            {balance}
                        </Text>
                        <Text size="6" weight="bold">
                            {communityConfig.primaryToken.symbol}
                        </Text>
                    </Flex>
                )}

                {isScrolled && (
                    <Flex
                        justify="center"
                        align="center"
                        gap="2"
                        className="w-full bg-white pt-8 pr-4"
                    >
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={community.logo} alt="community logo" />
                            <AvatarFallback>{communityConfig.primaryToken.symbol}</AvatarFallback>
                        </Avatar>
                        <Text size="8" weight="bold">
                            {balance}
                        </Text>
                        <Text size="6" weight="bold">
                            {communityConfig.primaryToken.symbol}
                        </Text>
                    </Flex>
                )}

                <Flex
                    justify="center"
                    gap={isScrolled ? "4" : "8"}
                    className={cn(
                        "w-full bg-white max-w-5xl items-center justify-between text-sm",
                        isScrolled ? "pt-2 pb-4 pr-4" : "pt-4 pr-4"
                    )}
                >

                    <ReceiveModal token={communityConfig.primaryToken} communityConfig={communityConfig}>
                        <WalletAction
                            compact={isScrolled}
                            icon={<ArrowDownIcon size={isScrolled ? 30 : 40} />}
                            label="Receive"
                        />
                    </ReceiveModal>


                </Flex>

                <Box className="bg-transparent-to-white h-10 w-full"></Box>
            </Flex>

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
