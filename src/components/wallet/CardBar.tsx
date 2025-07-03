import { Box, Flex, Text } from "@radix-ui/themes";
import { Config, CommunityConfig, Profile } from "@citizenwallet/sdk";
import WalletAction from "./Action";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import SendModal from "@/containers/wallet/SendModal";
import ReceiveModal from "@/containers/wallet/ReceiveModal";
import { AccountLogic } from "@/state/account/actions";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";

interface ActionBarProps {
  readonly?: boolean;
  cardColor: string;
  profile?: Profile;
  account: string;
  balance: string;
  small?: boolean;
  config: Config;
  accountActions: AccountLogic;
  tokenAddress?: string;
  onTokenChange?: (tokenAddress: string) => void;
}

export default function ActionBar({
  readonly = false,
  cardColor,
  profile,
  account,
  balance,
  small,
  config,
  accountActions,
  tokenAddress,
  onTokenChange,
}: ActionBarProps) {
  const { community, plugins = [] } = config;
  const communityConfig = new CommunityConfig(config);
  const token = communityConfig.getToken(tokenAddress);

  const logo = community.logo;

  // Get all available tokens
  const availableTokens = useMemo(() => {
    return Object.values(config.tokens || {});
  }, [config.tokens]);

  const handlePluginClick = (url: string) => {
    const baseUrl = new URL(window.location.href).origin;
    const fullUrl = `${url}?account=${account}&redirectUrl=${encodeURIComponent(
      baseUrl
    )}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  const handleTokenSelect = (selectedTokenAddress: string) => {
    onTokenChange?.(selectedTokenAddress);
  };

  return (
    <Flex
      direction="column"
      className="fixed z-50 top-0 bg-transparent-to-white-90 w-full max-w-xl items-center justify-between text-sm pr-4 pb-10"
    >
      <div
        className={cn(
          "aspect-[1.59] mt-12 mr-4 mb-8 z-50 relative",
          "flex items-start justify-start",
          "rounded-xl border border-white/80 shadow-[0_8px_16px_rgba(0,0,0,0.3)]",
          "animate-grow-bounce",
          "transition-all ease-in-out duration-200",
          small ? "w-[70%]" : "w-[80%]"
        )}
        style={{
          backgroundColor: cardColor,
        }}
      >
        <div className="absolute top-4 left-4 flex flex-col gap-2 animate-fade-in">
          <Text size="2" weight="bold" className="text-white">
            {profile?.username ? `@${profile?.username}` : "anonymous"}
          </Text>
          {profile?.name && (
            <Text size="2" weight="bold" className="text-white">
              {profile.name}
            </Text>
          )}
        </div>
        <div className="absolute top-4 right-4 animate-fade-in">
          <Image
            src="/nfc.png"
            alt="nfc"
            width={24}
            height={24}
            className="animate-fade-in"
          />
        </div>

        {/* Clickable balance section with token selector */}
        <div className="absolute bottom-4 right-4 flex items-center justify-center text-white space-x-2 animate-fade-in">
          {availableTokens.length > 1 ? (
            <Select value={tokenAddress} onValueChange={handleTokenSelect}>
              <SelectTrigger className="w-auto bg-transparent border border-white/80 text-white hover:bg-white/10 focus:ring-0 focus:ring-offset-0 px-2 py-1 h-auto rounded-full">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    <Image
                      src={token.logo ?? logo}
                      alt="community logo"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <Text size="8" weight="bold" className="text-white">
                      {balance}
                    </Text>
                    <div className="w-[4px]" />
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((availableToken) => (
                  <SelectItem
                    key={availableToken.address}
                    value={availableToken.address}
                    className="flex items-center space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Image
                        src={availableToken.logo ?? logo}
                        alt="community logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <Text size="4" weight="bold">
                        {availableToken.symbol}
                      </Text>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center space-x-2">
              <Image
                src={token.logo ?? logo}
                alt="community logo"
                width={48}
                height={48}
                className="rounded-full"
              />
              <Text size="8" weight="bold">
                {balance}
              </Text>
              <div className="w-[4px]" />
            </div>
          )}
        </div>
      </div>

      <Flex
        justify="center"
        gap={small ? "4" : "8"}
        className={cn(
          "w-full  max-w-5xl items-center justify-between text-sm",
          small ? "pt-2 pb-4 pr-4" : "pt-4 pr-4"
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

        {!readonly && (
          <ReceiveModal token={token} communityConfig={communityConfig}>
            <WalletAction
              compact={small}
              icon={<ArrowDownIcon size={small ? 30 : 40} />}
              label="Receive"
            />
          </ReceiveModal>
        )}

        {plugins
          .filter((plugin) =>
            plugin.token_address ? plugin.token_address === token.address : true
          )
          .map((plugin) => (
            <WalletAction
              key={plugin.name}
              compact={small}
              icon={
                <Image
                  src={plugin.icon}
                  alt={plugin.name}
                  width={24}
                  height={24}
                />
              }
              label={plugin.name}
              onClick={() => handlePluginClick(plugin.url)}
            />
          ))}
      </Flex>

      {/* <Box className="bg-transparent-to-white h-10 w-full"></Box> */}
    </Flex>
  );
}
