"use client";

import CopyBadge from "@/components/CopyBadge";
import QRCode from "@/components/qr/QRCode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatAddress, formatUrl } from "@/utils/formatting";
import { canGoBack } from "@/utils/history";
import { getWindow } from "@/utils/window";
import { Config, Profile, useSafeEffect } from "@citizenwallet/sdk";
import { Box, Flex, Text } from "@radix-ui/themes";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { getAvatarUrl } from "@/lib/utils";
import { useThemeUpdater } from "@/hooks/theme";
interface ContainerProps {
  config: Config;
  profile: Profile;
  receiveLink: string;
}

export default function Container({
  config,
  profile,
  receiveLink,
}: ContainerProps) {
  const { scan } = config;

  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(
    (ref.current ? ref.current.clientWidth : 200) * 0.8
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

    // can't go back for some reason, go home
    router.replace("/");
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
          <Avatar className="h-32 w-32 border-2 border-primary">
            <AvatarImage
              src={getAvatarUrl(profile?.image, profile?.account)}
              alt="user profile photo"
              className="object-cover"
            />
            <AvatarFallback>{profile.username ?? "USER"}</AvatarFallback>
          </Avatar>
          <Text size="4" weight="bold">
            {profile.name}
          </Text>
          <Text size="2">{profile.username}</Text>
        </Flex>
      </Flex>

      <Flex direction="column" justify="center" align="center" gap="4">
        <Box className="p-4 border-2 rounded-2xl border-primary">
          <QRCode size={size} qrCode={receiveLink} />
        </Box>
        <Flex justify="center">
          <CopyBadge label={formatUrl(receiveLink)} value={receiveLink} />
        </Flex>
        <Flex justify="center">
          <Button
            variant="link"
            className="gap-2"
            onClick={() => handleOpenExplorer(profile.account)}
          >
            View on {scan.name} <ArrowUpRight height={14} width={14} />
          </Button>
        </Flex>
      </Flex>
    </main>
  );
}
