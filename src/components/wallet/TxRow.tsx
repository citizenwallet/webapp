import { Flex, Text } from "@radix-ui/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ConfigToken,
  Profile,
  Transfer,
  useSafeEffect,
} from "@citizenwallet/sdk";
import { AGO_THRESHOLD, ago } from "@/utils/ago";
import { formatAddress } from "@/utils/formatting";
import { ProfilesActions } from "@/state/profiles/actions";
import { ZeroAddress, formatUnits } from "ethers";
import { getBurnerProfile, getMinterProfile } from "@/state/profiles/state";
import Link from "next/link";

interface TxRowProps {
  token: ConfigToken;
  account: string;
  tx: Transfer;
  actions: ProfilesActions;
  profiles: {
    [key: string]: Profile;
  };
  onClick?: (hash: string) => void;
}

export default function TxRow({
  token,
  account,
  tx,
  actions,
  profiles,
  onClick,
}: TxRowProps) {
  const self = tx.from === account;
  const other = self ? tx.to : tx.from;

  const isMinting = ZeroAddress === tx.from;
  const isBurning = ZeroAddress === tx.to;

  useSafeEffect(() => {
    actions.loadProfile(other);
  }, [other, actions]);

  let profile: Profile | undefined = profiles[other];
  if (isMinting) {
    profile = getMinterProfile(other);
  }

  if (isBurning) {
    profile = getBurnerProfile(other);
  }

  const weekAgo = Date.now() - AGO_THRESHOLD;
  const createdAt = new Date(tx.created_at);
  const formattedDate =
    createdAt.getTime() > weekAgo ? ago(createdAt) : createdAt.toDateString();

  const status = tx.status;

  return (
    <Flex
      justify="start"
      align="center"
      className="h-20 w-full max-w-full active:bg-muted rounded-lg"
      gap="3"
      onClick={() => onClick?.(tx.hash)}
    >
      <Avatar className="h-16 w-16 border-2 border-primary">
        <AvatarImage
          src={profile?.image_medium ?? "/anonymous-user.svg"}
          alt="user profile photo"
          className="object-cover"
        />
        <AvatarFallback>{profile?.username ?? "CN"}</AvatarFallback>
      </Avatar>
      <Flex direction="column" className="flex-1 w-full">
        <Text size="4" weight="bold">
          {profile?.name ?? "Anonymous"}
        </Text>
        <Text size="3">{profile?.username ?? formatAddress(other)}</Text>
        {tx.data?.description && (
          <Flex className="w-full h-6 overflow-hidden overflow-ellipsis">
            <Text size="3" className="text-muted-strong">
              {tx.data?.description}
            </Text>
          </Flex>
        )}
      </Flex>
      <Flex direction="column" justify="end" align="end">
        <Text size="4" weight="bold" className="text-primary">
          {self ? "-" : "+"} {formatUnits(`${tx.value}`, token.decimals)}
        </Text>
        {status === "success" && <Text size="2">{formattedDate}</Text>}
        {status !== "success" && (
          <Text size="2">{status === "fail" ? "failed" : "pending"}</Text>
        )}
      </Flex>
    </Flex>
  );
}
