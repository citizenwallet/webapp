import { Flex, Text } from "@radix-ui/themes";
import { Button } from "@/components/ui/button";

interface WalletActionProps {
  icon: React.ReactNode;
  label: string;
  alt?: boolean;
  onClick?: () => void;
}

export default function WalletAction({
  icon,
  label,
  alt = false,
  onClick,
}: WalletActionProps) {
  return (
    <Flex direction="column" justify="center" align="center" gap="2">
      <Button
        variant={alt ? "secondary" : "default"}
        onClick={onClick}
        className="h-20 w-20 rounded-full"
      >
        {icon}
      </Button>
      <Text size="4" weight="bold">
        {label}
      </Text>
    </Flex>
  );
}
