import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/mediaQuery";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Box, Flex, Text } from "@radix-ui/themes";
import {
  ConfigCommunity,
  ConfigToken,
  useSafeEffect,
} from "@citizenwallet/sdk";
import { useRef, useState } from "react";
import QRCode from "@/components/qr/QRCode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccountStore } from "@/state/account/state";
import { formatAddress, formatCurrency, formatUrl } from "@/utils/formatting";
import CopyBadge from "@/components/CopyBadge";
import { useReceive } from "@/state/receive/actions";
import { useReceiveStore } from "@/state/receive/state";
import { generateSelectReceiveDeepLink } from "@/state/receive/selectors";
import { DialogClose } from "@radix-ui/react-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAppName } from "@/utils/app";

interface ReceiveModalProps {
  token: ConfigToken;
  community: ConfigCommunity;
  children: React.ReactNode;
}

export default function ReceiveModal({
  token,
  community,
  children,
}: ReceiveModalProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(
    (ref.current ? ref.current.clientWidth : 200) * 0.8
  );

  useSafeEffect(() => {
    setSize((ref.current ? ref.current.clientWidth : 200) * 0.8);
  }, []);

  const account = useAccountStore((state) => state.account);

  const [receiveStore, actions] = useReceive();

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      setTimeout(() => {
        actions.clear();
      }, 500);
    }
  };

  useSafeEffect(() => {
    actions.clear();
  }, [actions]);

  const link = useReceiveStore(
    generateSelectReceiveDeepLink(account, community.alias)
  );
  const amount = receiveStore((state) => state.amount);
  const description = receiveStore((state) => state.description);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    actions.updateAmount(formatCurrency(amount, token.decimals > 0));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const description = e.target.value;
    actions.updateDescription(description);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          "h-full flex flex-col",
          isDesktop ? "sm:max-w-[425px]" : ""
        )}
      >
        <DialogHeader className="h-10 pb-4 justify-center">
          <DialogTitle>Receive</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="cw"
          className="flex flex-col flex-1 overflow-y-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cw">{getAppName()}</TabsTrigger>
            <TabsTrigger value="external">External</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="cw" className="w-full">
              <Flex direction="column" className="p-4 space-y-8">
                <Flex justify="center" align="center" className="w-full">
                  <Box className="p-4 border-2 rounded-2xl border-primary">
                    <QRCode size={size} qrCode={link} />
                  </Box>
                </Flex>
                <Flex justify="center" className="w-full">
                  <CopyBadge value={link} label={formatUrl(link)} />
                </Flex>
                <Flex align="center" className="relative w-full h-14">
                  <Text>Request</Text>
                  <Input
                    type="text"
                    id="amount"
                    placeholder={token.decimals > 0 ? "0.00" : "0"}
                    className="text-primary border-primary border-0 rounded-none border-b-2 ml-2 mr-2 pl-5 pr-5 w-full h-14 text-4xl text-center focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:ring-transparent"
                    value={amount}
                    onChange={handleAmountChange}
                  />
                  <Text size="6" weight="bold" className="font-bold">
                    {token.symbol}
                  </Text>
                </Flex>
                <Flex
                  direction="column"
                  align="start"
                  className="relative w-full gap-4"
                >
                  <Text>Description</Text>
                  <Input
                    type="text"
                    id="description"
                    placeholder="Enter a description"
                    className="pl-5 pr-5 w-full h-14 text-base"
                    value={description}
                    onChange={handleDescriptionChange}
                  />
                </Flex>
              </Flex>
            </TabsContent>
            <TabsContent value="external" className="w-full">
              <Flex direction="column" className="p-4 space-y-8">
                <Flex justify="center" align="center" className="w-full">
                  <Box className="p-4 border-2 rounded-2xl border-primary">
                    <QRCode size={size} qrCode={account} />
                  </Box>
                </Flex>
                <Flex justify="center" className="w-full">
                  <CopyBadge value={account} label={formatAddress(account)} />
                </Flex>
              </Flex>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        <DialogFooter className="h-12 pb-4 justify-center">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
