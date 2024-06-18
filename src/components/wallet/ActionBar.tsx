import { Box, Flex, Text } from "@radix-ui/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfigCommunity, ConfigToken } from "@citizenwallet/sdk";
import WalletAction from "./Action";
import { ArrowDownIcon, ArrowUpIcon, EllipsisIcon } from "lucide-react";
import SendModal from "@/containers/wallet/SendModal";

interface ActionBarProps {
  balance: string;
  small?: boolean;
  community: ConfigCommunity;
  token: ConfigToken;
}

export default function ActionBar({
  balance,
  small,
  community,
  token,
}: ActionBarProps) {
  return (
    <Flex
      direction="column"
      className="z-10 sticky top-0 left-0 w-full max-w-5xl items-center justify-between font-mono text-sm"
    >
      {!small && (
        <Flex
          justify="center"
          align="center"
          gap="2"
          className="w-full bg-white pt-4"
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
          className="w-full bg-white pt-4"
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
          className="w-full bg-white pt-4"
        >
          <Text size="9" weight="bold">
            {balance}
          </Text>
          <Text size="6" weight="bold">
            {token.symbol}
          </Text>
        </Flex>
      )}

      {!small && (
        <Flex
          justify="center"
          gap="8"
          className="w-full bg-white pt-4 max-w-5xl items-center justify-between font-mono text-sm"
        >
          <SendModal token={token}>
            <WalletAction icon={<ArrowUpIcon size={40} />} label="Send" />
          </SendModal>

          <WalletAction icon={<ArrowDownIcon size={40} />} label="Receive" />
        </Flex>
      )}

      {small && (
        <Flex
          justify="center"
          align="center"
          gap="2"
          className="w-full bg-white pt-8"
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

      {small && (
        <Flex
          justify="center"
          gap="4"
          className="w-full bg-white pt-2 pb-4 max-w-5xl items-center justify-between font-mono text-sm"
        >
          <SendModal token={token}>
            <WalletAction
              compact
              icon={<ArrowUpIcon size={30} />}
              label="Send"
            />
          </SendModal>

          <WalletAction
            compact
            icon={<ArrowDownIcon size={30} />}
            label="Receive"
          />
        </Flex>
      )}

      <Box className="bg-transparent-to-white h-10 w-full"></Box>
    </Flex>
  );
}
