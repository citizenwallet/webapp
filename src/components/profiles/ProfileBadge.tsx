import { cn, getAvatarUrl } from "@/lib/utils";
import { Flex, Text } from "@radix-ui/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@citizenwallet/sdk";

interface ProfileBadgeProps {
  profile: Profile;
}

export default function ProfileBadge({ profile, ...props }: ProfileBadgeProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="4"
      className={cn("px-4 py-4 cursor-pointer")}
      {...props}
    >
      <Avatar className="h-40 w-40">
        <AvatarImage
          src={getAvatarUrl(profile?.image, profile?.account)}
          alt="avatar"
          className="object-cover"
        />
        <AvatarFallback>{profile.username}</AvatarFallback>
      </Avatar>
      <Flex direction="column" align="center" gap="4">
        <h2 className="font-bold">{profile.name}</h2>
        <Text size="4" weight="regular" className="text-muted-strong">
          {profile.username}
        </Text>
      </Flex>
    </Flex>
  );
}
