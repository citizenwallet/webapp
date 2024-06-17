import { Flex, Text } from "@radix-ui/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile, Transfer } from "@citizenwallet/sdk";
import { AGO_THRESHOLD, ago } from "@/utils/ago";
import { formatAddress } from "@/utils/address";

interface TxRowProps {
  account: string;
  tx: Transfer;
  profiles: {
    [key: string]: Profile;
  };
}

export default function TxRow({ account, tx, profiles }: TxRowProps) {
  const self = tx.from === account;
  const other = self ? tx.to : tx.from;

  const profile: Profile | undefined = profiles[other];

  const weekAgo = Date.now() - AGO_THRESHOLD;
  const createdAt = new Date(tx.created_at);
  const formattedDate =
    createdAt.getTime() > weekAgo ? ago(createdAt) : createdAt.toDateString();

  return (
    <Flex
      justify="start"
      align="center"
      className="h-20 w-full max-w-full"
      gap="3"
    >
      <Avatar className="h-16 w-16 border-2 border-primary">
        <AvatarImage
          src={profile?.image_medium ?? "https://github.com/shadcn.png"}
          alt="user profile photo"
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
          {self ? "-" : "+"} {tx.value}
        </Text>
        <Text size="2">{formattedDate}</Text>
      </Flex>
    </Flex>
  );
}
