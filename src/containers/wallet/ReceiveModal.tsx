import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/mediaQuery";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Box, Flex, Text } from "@radix-ui/themes";
import {
  ConfigCommunity,
  ConfigToken,
  useSafeEffect,
} from "@citizenwallet/sdk";
import { useRef, useState } from "react";
import { useSend } from "@/state/send/actions";
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

  const [_, actions] = useSend();

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      setTimeout(() => {
        actions.clear();
      }, 500);
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="h-5/6 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Receive</DialogTitle>
          </DialogHeader>
          <ReceiveForm
            isInModal
            token={token}
            community={community}
            className="h-full"
          />
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const contentHeight =
    typeof window !== "undefined" ? window.innerHeight : 200;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-full" style={{ height: contentHeight }}>
        <DialogHeader>
          <DialogTitle>Receive</DialogTitle>
        </DialogHeader>
        <ReceiveForm
          token={token}
          community={community}
          className="h-full px-4"
        />
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ReceiveFormProps {
  isInModal?: boolean;
  community: ConfigCommunity;
  token: ConfigToken;
  className?: string;
}

const ReceiveForm = ({
  isInModal = false,
  token,
  community,
  className,
}: ReceiveFormProps) => {
  const divHeight =
    typeof window !== "undefined"
      ? isInModal
        ? window.innerHeight * 0.6
        : window.innerHeight
      : 200;
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(
    (ref.current ? ref.current.clientWidth : 200) * 0.8
  );

  useSafeEffect(() => {
    setSize((ref.current ? ref.current.clientWidth : 200) * 0.8);
  }, []);

  const account = useAccountStore((state) => state.account);

  const [receiveStore, actions] = useReceive();

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
    <Flex
      ref={ref}
      direction="column"
      justify="start"
      align="center"
      className={cn("w-full items-start gap-4", className)}
    >
      <Tabs defaultValue="cw" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cw">Citizen Wallet</TabsTrigger>
          <TabsTrigger value="external">External</TabsTrigger>
        </TabsList>
        <TabsContent value="cw" className="pt-4">
          <ScrollArea
            className="h-full overflow-scroll pb-60"
            style={{ maxHeight: divHeight - 200 }}
          >
            <Flex justify="center" align="center" className="w-full">
              <Box className="p-4 border-2 rounded-2xl border-primary">
                <QRCode size={size} qrCode={link} />
              </Box>
            </Flex>
            <Flex justify="center" className="w-full pt-4">
              <CopyBadge value={link} label={formatUrl(link)} />
            </Flex>
            <Flex
              align="center"
              className="relative w-full h-14 pl-10 pr-10 mt-8"
            >
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
              className="relative w-full pl-10 pr-10 my-8 gap-4"
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
          </ScrollArea>
        </TabsContent>
        <TabsContent value="external" className="pt-4">
          <Flex direction="column">
            <Flex justify="center" align="center" className="w-full">
              <Box className="p-4 border-2 rounded-2xl border-primary">
                <QRCode size={size} qrCode={account} />
              </Box>
            </Flex>
            <Flex justify="center" className="w-full py-4">
              <CopyBadge value={account} label={formatAddress(account)} />
            </Flex>
          </Flex>
        </TabsContent>
      </Tabs>
    </Flex>
  );
};
