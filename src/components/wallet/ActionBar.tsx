import { Box, Flex, Text } from "@radix-ui/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Config } from "@citizenwallet/sdk";
import WalletAction from "./Action";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import SendModal from "@/containers/wallet/SendModal";
import ReceiveModal from "@/containers/wallet/ReceiveModal";
import { AccountLogic } from "@/state/account/actions";
import { cn } from "@/lib/utils";

interface ActionBarProps {
  balance: string;
  small?: boolean;
  config: Config;
  accountActions: AccountLogic;
}

export default function ActionBar({
  balance,
  small,
  config,
  accountActions,
}: ActionBarProps) {
  const { community, token } = config;

  return (
    <Flex
      direction="column"
      className="fixed top-0 w-full max-w-xl items-center justify-between text-sm pr-4"
    >
      {!small && (
        <Flex
          justify="center"
          align="center"
          gap="2"
          className="w-full bg-white pt-4 pr-4"
        >
          <Avatar className="h-28 w-28">
            <AvatarImage src={community.logo} alt="community logo" />
            <AvatarFallback>{token.symbol}</AvatarFallback>
          </Avatar>
        </Flex>
      )}

      {!small && (
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

      {!small && (
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
            {token.symbol}
          </Text>
        </Flex>
      )}

      {small && (
        <Flex
          justify="center"
          align="center"
          gap="2"
          className="w-full bg-white pt-8 pr-4"
        >
          <Avatar className="h-14 w-14">
            <AvatarImage src={community.logo} alt="community logo" />
            <AvatarFallback>{token.symbol}</AvatarFallback>
          </Avatar>
          <Text size="8" weight="bold">
            {balance}
          </Text>
          <Text size="6" weight="bold">
            {token.symbol}
          </Text>
        </Flex>
      )}

      <Flex
        justify="center"
        gap={small ? "4" : "8"}
        className={cn(
          "w-full bg-white max-w-5xl items-center justify-between text-sm",
          small ? "pt-2 pb-4 pr-4" : "pt-4 pr-4"
        )}
      >
        <SendModal config={config} accountActions={accountActions}>
          <WalletAction
            compact={small}
            icon={<ArrowUpIcon size={small ? 30 : 40} />}
            label="Send"
          />
        </SendModal>

        <ReceiveModal token={token} community={community}>
          <WalletAction
            compact={small}
            icon={<ArrowDownIcon size={small ? 30 : 40} />}
            label="Receive"
          />
        </ReceiveModal>
      </Flex>

      <Box className="bg-transparent-to-white h-10 w-full"></Box>
    </Flex>
  );
}
