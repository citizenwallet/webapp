"use client";

import CopyBadge from "@/components/CopyBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import { formatAddress } from "@/utils/formatting";
import { canGoBack } from "@/utils/history";
import { getWindow } from "@/utils/window";
import { getAvatarUrl } from "@/lib/utils";
import { Config, Profile, Log, CommunityConfig } from "@citizenwallet/sdk";
import { Box, Flex, Text } from "@radix-ui/themes";
import { formatUnits } from "ethers";
import { ArrowLeft, ArrowRight, ArrowUpRight, StickyNote } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useThemeUpdater } from "@/hooks/theme";
import { Skeleton } from "@/components/ui/skeleton";
interface ContainerProps {
  tx?: Log;
  fromProfile?: Profile;
  toProfile?: Profile;
  config: Config;
}

export default function Container({
  tx,
  fromProfile,
  toProfile,
  config,
}: ContainerProps) {
  const { community, scan } = config;
  const communityConfig = new CommunityConfig(config);
  const primaryToken = communityConfig.primaryToken;

  useThemeUpdater(community);

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
    getWindow()?.open(`${scan.url}/tx/${txHash}`, "_blank");
  };

  const createdAt = formatDate(new Date(tx?.created_at ?? 0));

  const isSuccess = tx?.status === "success";

  let description = "";
  if (tx?.extra_data) {
    const extraData = tx.extra_data as { [key: string]: string };
    description = "description" in extraData ? extraData.description : "";
  }

  return (
    <main className="flex min-h-screen w-full flex-col align-center p-4 max-w-xl gap-12">
      <Flex className="h-10">
        <ArrowLeft
          className="active:bg-muted rounded-full cursor-pointer"
          onClick={handleBack}
        />
      </Flex>
      <Flex justify="center" align="center" gap="4">
        <Flex direction="column" justify="center" align="center">
          {fromProfile && tx ? (
            <Link href={`/profile/${fromProfile.account}`}>
              <Avatar className="h-28 w-28 border-2 border-primary">
                <AvatarImage
                  src={getAvatarUrl(fromProfile.image_medium, tx.data?.from)}
                  alt="user profile photo"
                  className="object-cover"
                />
                <AvatarFallback>
                  {fromProfile.username ?? "USER"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-28 w-28 border-2 border-primary">
              <AvatarImage alt="user profile photo" className="object-cover" />
              <AvatarFallback>USER</AvatarFallback>
            </Avatar>
          )}
          {fromProfile ? (
            <Text size="4" weight="bold">
              {fromProfile.name}
            </Text>
          ) : (
            <Skeleton className="h-8 w-24" />
          )}
          {fromProfile ? (
            <Text size="2">{fromProfile.username}</Text>
          ) : (
            <Skeleton className="h-4 w-24" />
          )}
        </Flex>
        <ArrowRight />
        <Flex direction="column" justify="center" align="center">
          {toProfile && tx ? (
            <Link href={`/profile/${toProfile.account}`}>
              <Avatar className="h-28 w-28 border-2 border-primary">
                <AvatarImage
                  src={getAvatarUrl(toProfile.image_medium, tx.to)}
                  alt="user profile photo"
                  className="object-cover"
                />
                <AvatarFallback>{toProfile.username ?? "USER"}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-28 w-28 border-2 border-primary">
              <AvatarImage alt="user profile photo" className="object-cover" />
              <AvatarFallback>USER</AvatarFallback>
            </Avatar>
          )}
          {toProfile ? (
            <Text size="4" weight="bold">
              {toProfile.name}
            </Text>
          ) : (
            <Skeleton className="h-8 w-24" />
          )}
          {toProfile ? (
            <Text size="2">{toProfile.username}</Text>
          ) : (
            <Skeleton className="h-4 w-24" />
          )}
        </Flex>
      </Flex>

      <Flex direction="column" gap="2">
        <Flex justify="center" align="center" gap="4">
          <Text size="8" weight="bold">
            {formatUnits(`${tx?.data?.value ?? 0}`, primaryToken.decimals)}
          </Text>
          <Text size="6" weight="bold">
            {primaryToken.symbol}
          </Text>
        </Flex>
        <Flex justify="center">
          {tx ? (
            <Badge variant="secondary">{tx.status}</Badge>
          ) : (
            <Skeleton className="h-8 w-24" />
          )}
        </Flex>
        {isSuccess ? (
          <Flex justify="center">{createdAt}</Flex>
        ) : (
          <Flex justify="center">
            <Skeleton className="h-8 w-24" />
          </Flex>
        )}
      </Flex>

      <Flex justify="center">
        {description !== "" && (
          <Box className="relative p-4 border border-solid border-muted rounded-xl">
            <StickyNote size={18} className="absolute -top-1 -left-1" />
            {description}
          </Box>
        )}
      </Flex>

      <Flex direction="column" gap="4">
        <Flex justify="center">
          {tx ? (
            <CopyBadge label={formatAddress(tx.tx_hash)} value={tx.tx_hash} />
          ) : (
            <Skeleton className="h-8 w-24" />
          )}
        </Flex>
        <Flex justify="center">
          <Button
            variant="link"
            className="gap-2"
            disabled={!tx}
            onClick={() => handleOpenExplorer(tx?.tx_hash ?? "")}
          >
            View on {scan.name} <ArrowUpRight height={14} width={14} />
          </Button>
        </Flex>
      </Flex>
    </main>
  );
}
