"use client";

import CopyBadge from "@/components/CopyBadge";
import QRCode from "@/components/qr/QRCode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatAddress, formatUrl } from "@/utils/formatting";
import { canGoBack } from "@/utils/history";
import { getWindow } from "@/utils/window";
import { Config, Profile } from "@citizenwallet/sdk";
import { useSafeEffect } from "@/hooks/useSafeEffect";
import { Box, Flex, Text } from "@radix-ui/themes";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { getAvatarUrl } from "@/lib/utils";
import { useThemeUpdater } from "@/hooks/theme";
import { Skeleton } from "@/components/ui/skeleton";
import Signout from "./signout";

interface ContainerProps {
  config: Config;
  profile?: Profile;
  receiveLink?: string;
}

export default function Container({
  config,
  profile,
  receiveLink,
}: ContainerProps) {
  const { scan } = config;

  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(
    (ref.current ? ref.current.clientWidth : 200) * 0.8,
  );

  useThemeUpdater(config.community);

  useSafeEffect(() => {
    setSize((ref.current ? ref.current.clientWidth : 200) * 0.8);
  }, []);

  const router = useRouter();

  const handleBack = () => {
    if (canGoBack()) {
      router.back();
      return;
    }
  };

  const handleOpenExplorer = (account: string) => {
    getWindow()?.open(`${scan.url}/address/${account}`, "_blank");
  };

  return (
    <main
      ref={ref}
      className="flex min-h-screen w-full flex-col align-center p-4 max-w-xl gap-12"
    >
      <Flex className="h-10">
        <ArrowLeft
          className="active:bg-muted rounded-full cursor-pointer"
          onClick={handleBack}
        />
      </Flex>
      <Flex justify="center" align="center" gap="4">
        <Flex direction="column" justify="center" align="center">
          {profile ? (
            <Avatar className="h-32 w-32 border-2 border-primary">
              <AvatarImage
                src={getAvatarUrl(profile?.image, profile?.account)}
                alt="user profile photo"
                className="object-cover"
              />
              <AvatarFallback>{profile.username ?? "USER"}</AvatarFallback>
            </Avatar>
          ) : (
            <Skeleton className="h-32 w-32 rounded-full" />
          )}
          {profile ? (
            <Text size="4" weight="bold">
              {profile.name}
            </Text>
          ) : (
            <Skeleton className="h-8 w-24" />
          )}
          {profile ? (
            <Text size="2">{profile.username}</Text>
          ) : (
            <Skeleton className="h-4 w-24" />
          )}
        </Flex>
      </Flex>

      <Flex direction="column" justify="center" align="center" gap="4">
        <Box className="p-4 border-2 rounded-2xl border-primary">
          {receiveLink ? (
            <QRCode size={size} qrCode={receiveLink} />
          ) : (
            <Skeleton className="h-32 w-32" />
          )}
        </Box>
        <Flex justify="center">
          {receiveLink ? (
            <CopyBadge label={formatUrl(receiveLink)} value={receiveLink} />
          ) : (
            <Skeleton className="h-8 w-24" />
          )}
        </Flex>
        <Flex justify="center">
          {profile ? (
            <Button
              variant="link"
              className="gap-2"
              onClick={() => handleOpenExplorer(profile.account)}
            >
              View on {scan.name} <ArrowUpRight height={14} width={14} />
            </Button>
          ) : (
            <Skeleton className="h-8 w-24" />
          )}
        </Flex>
      </Flex>

      <div className="w-full h-[1px] bg-border" />

      <Signout config={config} />
    </main>
  );
}
