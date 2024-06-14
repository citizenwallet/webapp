"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import WalletAction from "@/components/wallet/Action";
import TxRow from "@/components/wallet/TxRow";
import { Config } from "@citizenwallet/sdk";
import { Box, Flex, Text } from "@radix-ui/themes";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EllipsisIcon,
  QrCodeIcon,
} from "lucide-react";
import Image from "next/image";

interface WalletProps {
  config: Config;
}

export default function Wallet({ config }: WalletProps) {
  const { community, token } = config;

  const handleScan = () => {
    console.log("scan");
  };

  return (
    <main className="flex min-h-screen w-full flex-col align-center p-4 max-w-xl">
      <Avatar className="z-20 fixed right-0 top-0 m-4 border-2 border-primary">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <Flex
        justify="center"
        align="center"
        gap="2"
        className="z-20 fixed right-0 bottom-0 w-full mb-6"
      >
        <Button
          variant="ghost"
          onClick={handleScan}
          className="h-20 w-20 rounded-full border-primary border-4 m-4 shadow-lg bg-white"
        >
          <QrCodeIcon size={40} className="text-primary" />
        </Button>
      </Flex>

      <Flex
        direction="column"
        className="z-10 sticky top-0 left-0 w-full max-w-5xl items-center justify-between font-mono text-sm"
      >
        <Flex
          justify="center"
          align="center"
          gap="2"
          className="w-full bg-white pt-10"
        >
          <Avatar className="h-28 w-28">
            <AvatarImage src={community.logo} alt="community logo" />
            <AvatarFallback>{token.symbol}</AvatarFallback>
          </Avatar>
        </Flex>

        <Flex
          justify="center"
          align="center"
          gap="2"
          className="w-full bg-white pt-4"
        >
          <Text size="6" weight="bold" className="text-muted-strong">
            {community.name}
          </Text>
        </Flex>

        <Flex
          justify="center"
          align="center"
          gap="2"
          className="w-full bg-white pt-4"
        >
          <Text size="9" weight="bold">
            10.00
          </Text>
          <Text size="6" weight="bold">
            {token.symbol}
          </Text>
        </Flex>

        <Flex
          justify="center"
          gap="6"
          className="w-full bg-white pt-10 pb-4 max-w-5xl items-center justify-between font-mono text-sm"
        >
          <WalletAction icon={<ArrowUpIcon size={40} />} label="Send" />
          <WalletAction icon={<ArrowDownIcon size={40} />} label="Receive" />
          <WalletAction
            alt
            icon={<EllipsisIcon size={40} className="text-primary" />}
            label="More"
          />
        </Flex>
        <Box className="bg-transparent-to-white h-10 w-full"></Box>
      </Flex>

      <Flex direction="column" className="w-full max-w-md" gap="3">
        {Array.from({ length: 100 }).map((_, index) => (
          <TxRow key={index} />
        ))}
      </Flex>

      <Box className="z-10 sticky bottom-0 left-0 w-full bg-transparent-from-white h-10 w-full"></Box>
    </main>
  );
}
