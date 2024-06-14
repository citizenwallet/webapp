import { Flex, Text } from "@radix-ui/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TxRow() {
  return (
    <Flex justify="start" align="center" className="h-20 w-full" gap="3">
      <Avatar className="h-16 w-16 border-2 border-primary">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Flex direction="column" className="flex-1">
        <Text size="6" weight="bold">
          John Doe
        </Text>
        <Text size="4">John Doe</Text>
      </Flex>
      <Flex direction="column" justify="end" align="end">
        <Text size="6" weight="bold" className="text-primary">
          +10.00
        </Text>
        <Text size="2">5m</Text>
      </Flex>
    </Flex>
  );
}
