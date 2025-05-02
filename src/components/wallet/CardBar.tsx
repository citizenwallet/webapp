import { Box, Flex, Text } from "@radix-ui/themes";
import { Config, CommunityConfig, Profile } from "@citizenwallet/sdk";
import WalletAction from "./Action";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import SendModal from "@/containers/wallet/SendModal";
import ReceiveModal from "@/containers/wallet/ReceiveModal";
import { AccountLogic } from "@/state/account/actions";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ActionBarProps {
  readonly?: boolean;
  cardColor: string;
  profile?: Profile;
  account: string;
  balance: string;
  small?: boolean;
  config: Config;
  accountActions: AccountLogic;
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
}: ActionBarProps) {
  const { community, plugins = [] } = config;
  const communityConfig = new CommunityConfig(config);
  const primaryToken = communityConfig.primaryToken;

  const logo = community.logo;

  const handlePluginClick = (url: string) => {
    const baseUrl = new URL(window.location.href).origin;
    const fullUrl = `${url}?account=${account}&redirectUrl=${encodeURIComponent(
      baseUrl
    )}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Flex
      direction="column"
      className="fixed top-0 w-full max-w-xl items-center justify-between text-sm pr-4"
    >
      <div
        className="w-[80%] aspect-[1.59] mt-12 mr-4 mb-8 relative flex items-start justify-start rounded-xl border border-white/80 shadow-[0_8px_16px_rgba(0,0,0,0.3)] animate-grow-bounce"
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
        <div className="absolute bottom-4 right-4 flex items-center justify-center text-white space-x-2 animate-fade-in">
          <Image
            src={logo}
            alt="community logo"
            width={48}
            height={48}
            className="rounded-full"
          />
          <Text size="8" weight="bold">
            {balance}
          </Text>
        </div>
      </div>

      <Flex
        justify="center"
        gap={small ? "4" : "8"}
        className={cn(
          "w-full bg-white max-w-5xl items-center justify-between text-sm",
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

        <ReceiveModal token={primaryToken} communityConfig={communityConfig}>
          <WalletAction
            compact={small}
            icon={<ArrowDownIcon size={small ? 30 : 40} />}
            label="Receive"
          />
        </ReceiveModal>

        {plugins.map((plugin) => (
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

      <Box className="bg-transparent-to-white h-10 w-full"></Box>
    </Flex>
  );
}
