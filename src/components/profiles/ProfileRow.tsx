import { cn } from "@/lib/utils";
import { Flex, Text } from "@radix-ui/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@citizenwallet/sdk";

interface ProfileRowProps {
  profile: Profile;
  onSelect?: (profile: Profile) => void;
  fullWidth?: boolean;
  selected?: boolean;
}

export default function ProfileRow({
  profile,
  onSelect,
  fullWidth = true,
  selected = false,
  ...props
}: ProfileRowProps) {
  return (
    <Flex
      align="center"
      justify="start"
      gap="4"
      className={cn(
        "px-4 py-4 cursor-pointer",
        fullWidth ? "w-full" : "",
        selected ? "bg-gray-100" : "hover:bg-gray-100"
      )}
      onClick={onSelect ? () => onSelect(profile) : undefined}
      {...props}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage
          src={profile.image_medium}
          alt="avatar"
          className="object-cover"
        />
        <AvatarFallback>{profile.username}</AvatarFallback>
      </Avatar>
      <Flex direction="column" align="start" gap="4" className="pl-4">
        <Text size="5" weight="bold">
          {profile.name}
        </Text>
        <Text size="3" weight="regular" className="text-muted-strong">
          {profile.username}
        </Text>
      </Flex>
    </Flex>
  );
}
