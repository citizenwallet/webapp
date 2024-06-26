"use client";

import CopyBadge from "@/components/CopyBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import { formatAddress } from "@/utils/formatting";
import { canGoBack } from "@/utils/history";
import { Config, Profile, Transfer } from "@citizenwallet/sdk";
import { Box, Flex, Text } from "@radix-ui/themes";
import { formatUnits } from "ethers";
import { ArrowLeft, ArrowRight, ArrowUpRight, StickyNote } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContainerProps {
  tx: Transfer;
  fromProfile: Profile;
  toProfile: Profile;
  config: Config;
}

export default function Container({
  tx,
  fromProfile,
  toProfile,
  config,
}: ContainerProps) {
  const { token, scan } = config;

  const router = useRouter();

  const handleBack = () => {
    if (canGoBack()) {
      router.back();
      return;
    }

    // can't go back for some reason, go home
    router.replace("/");
  };

  const handleOpenExplorer = (txHash: string) => {
    window.open(`${scan.url}/tx/${txHash}`, "_blank");
  };

  const createdAt = formatDate(tx.created_at);

  const isSuccess = tx.status === "success";

  return (
    <main className="flex min-h-screen w-full flex-col align-center p-4 max-w-xl gap-12">
      <Flex className="h-10">
        <ArrowLeft
          className="active:bg-muted rounded-full"
          onClick={handleBack}
        />
      </Flex>
      <Flex justify="center" align="center" gap="4">
        <Flex direction="column" justify="center" align="center">
          <Avatar className="h-28 w-28 border-2 border-primary">
            <AvatarImage
              src={fromProfile.image_medium ?? "/anonymous-user.svg"}
              alt="user profile photo"
              className="object-cover"
            />
            <AvatarFallback>{fromProfile.username ?? "USER"}</AvatarFallback>
          </Avatar>
          <Text size="4" weight="bold">
            {fromProfile.name}
          </Text>
          <Text size="2">{fromProfile.username}</Text>
        </Flex>
        <ArrowRight />
        <Flex direction="column" justify="center" align="center">
          <Avatar className="h-28 w-28 border-2 border-primary">
            <AvatarImage
              src={toProfile.image_medium ?? "/anonymous-user.svg"}
              alt="user profile photo"
              className="object-cover"
            />
            <AvatarFallback>{toProfile.username ?? "USER"}</AvatarFallback>
          </Avatar>
          <Text size="4" weight="bold">
            {toProfile.name}
          </Text>
          <Text size="2">{toProfile.username}</Text>
        </Flex>
      </Flex>

      <Flex direction="column" gap="2">
        <Flex justify="center" align="center" gap="4">
          <Text size="8" weight="bold">
            {formatUnits(`${tx.value ?? 0}`, token.decimals)}
          </Text>
          <Text size="6" weight="bold">
            {token.symbol}
          </Text>
        </Flex>
        <Flex justify="center">
          <Badge variant="secondary">{tx.status}</Badge>
        </Flex>
        {isSuccess && <Flex justify="center">{createdAt}</Flex>}
      </Flex>

      <Flex justify="center">
        {tx.data && (
          <Box className="relative p-4 border border-solid border-muted rounded-xl">
            <StickyNote size={18} className="absolute -top-1 -left-1" />
            {tx.data.description}
          </Box>
        )}
      </Flex>

      <Flex direction="column" gap="4">
        <Flex justify="center">
          <CopyBadge label={formatAddress(tx.tx_hash)} value={tx.tx_hash} />
        </Flex>
        <Flex justify="center">
          <Button
            variant="default"
            className="gap-2"
            disabled={!tx}
            onClick={() => handleOpenExplorer(tx.tx_hash)}
          >
            View on {scan.name} <ArrowUpRight height={14} width={14} />
          </Button>
        </Flex>
      </Flex>
    </main>
  );
}
