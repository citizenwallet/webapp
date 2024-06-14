import { Box, Flex, Text } from "@radix-ui/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfigCommunity, ConfigToken } from "@citizenwallet/sdk";
import WalletAction from "./Action";
import { ArrowDownIcon, ArrowUpIcon, EllipsisIcon } from "lucide-react";

interface ActionBarProps {
  small?: boolean;
  community: ConfigCommunity;
  token: ConfigToken;
}

export default function ActionBar({ small, community, token }: ActionBarProps) {
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
          className="w-full bg-white pt-10"
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

      <Flex
        justify="center"
        align="center"
        gap="2"
        className="w-full bg-white pt-4"
      >
        <Text size="9" weight="bold">
          10.00
        </Text>
        <Text size="6" weight="bold">
          {token.symbol}
        </Text>
      </Flex>

      <Flex
        justify="center"
        gap="6"
        className="w-full bg-white pt-10 pb-4 max-w-5xl items-center justify-between font-mono text-sm"
      >
        <WalletAction icon={<ArrowUpIcon size={40} />} label="Send" />
        <WalletAction icon={<ArrowDownIcon size={40} />} label="Receive" />
        <WalletAction
          alt
          icon={<EllipsisIcon size={40} className="text-primary" />}
          label="More"
        />
      </Flex>
      <Box className="bg-transparent-to-white h-10 w-full"></Box>
    </Flex>
  );
}
