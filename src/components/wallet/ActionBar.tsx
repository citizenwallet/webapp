import { Box, Flex, Text } from "@radix-ui/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Config, CommunityConfig } from "@citizenwallet/sdk";
import WalletAction from "./Action";
import { ArrowDownIcon, ArrowUpIcon, EllipsisIcon } from "lucide-react";
import SendModal from "@/containers/wallet/SendModal";
import ReceiveModal from "@/containers/wallet/ReceiveModal";
import { AccountLogic } from "@/state/account/actions";
import { cn } from "@/lib/utils";
import PluginsSheet from "./PluginsSheet";

interface ActionBarProps {
  readonly?: boolean;
  account: string;
  balance: string;
  small?: boolean;
  config: Config;
  accountActions: AccountLogic;
}

export default function ActionBar({
  readonly = false,
  account,
  balance,
  small,
  config,
  accountActions,
}: ActionBarProps) {
  const { community, plugins = [] } = config;
  const communityConfig = new CommunityConfig(config);
  const primaryToken = communityConfig.primaryToken;

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
            <AvatarFallback>{primaryToken.symbol}</AvatarFallback>
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
            {primaryToken.symbol}
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
            <AvatarFallback>{primaryToken.symbol}</AvatarFallback>
          </Avatar>
          <Text size="8" weight="bold">
            {balance}
          </Text>
          <Text size="6" weight="bold">
            {primaryToken.symbol}
          </Text>
        </Flex>
      )}

      <Flex
        justify="center"
        gap={small ? "4" : "8"}
        className={cn(
          "w-full bg-white max-w-5xl items-center justify-between text-sm",
          small ? "pt-2 pb-4 pr-4" : "pt-4 pr-4",
        )}
      >
        {!readonly && (
          <SendModal config={config} accountActions={accountActions}>
            <WalletAction
              compact={small}
              icon={<ArrowUpIcon size={small ? 30 : 40} />}
              label="Send"
            />
          </SendModal>
        )}

        <ReceiveModal token={primaryToken} communityConfig={communityConfig}>
          <WalletAction
            compact={small}
            icon={<ArrowDownIcon size={small ? 30 : 40} />}
            label="Receive"
          />
        </ReceiveModal>

        {plugins.length > 0 && (
          <PluginsSheet account={account} plugins={plugins}>
            <WalletAction
              compact={small}
              alt
              icon={
                <EllipsisIcon size={small ? 30 : 40} className="text-primary" />
              }
              label="More"
            />
          </PluginsSheet>
        )}
      </Flex>

      <Box className="bg-transparent-to-white h-10 w-full"></Box>
    </Flex>
  );
}
