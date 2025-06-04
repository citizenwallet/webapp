import { Flex, Text } from "@radix-ui/themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WalletActionProps {
  icon: React.ReactNode;
  label: string;
  alt?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export default function WalletAction({
  icon,
  label,
  compact = false,
  alt = false,
  onClick,
}: WalletActionProps) {
  return (
    <Flex direction="column" justify="center" align="center" gap="2">
      <Button
        variant={alt ? "secondary" : "default"}
        onClick={onClick}
        className={cn(
          "rounded-full gap-2 transition-all ease-in-out duration-200",
          compact ? "h-18 w-40" : "h-20 w-20",
        )}
      >
        {compact && (
          <Text size="4" weight="bold">
            {label}
          </Text>
        )}
        {icon}
      </Button>

      {!compact && (
        <Text size="4" weight="bold" className="animate-fade-in-fast">
          {label}
        </Text>
      )}
    </Flex>
  );
}
