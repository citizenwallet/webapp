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
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightIcon, QrCodeIcon, SearchIcon } from "lucide-react";
import { useSendStore } from "@/state/send/state";
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes";
import ProfileRow from "@/components/profiles/ProfileRow";
import { getEmptyProfile, useProfilesStore } from "@/state/profiles/state";
import { Config, Profile } from "@citizenwallet/sdk";
import { useState } from "react";
import { useSend } from "@/state/send/actions";
import { DialogClose } from "@radix-ui/react-dialog";
import QRScannerModal from "./QRScannerModal";
import { formatCurrency } from "@/utils/formatting";
import { useProfiles } from "@/state/profiles/actions";
import { AccountLogic, useAccount } from "@/state/account/actions";
import { useAccountStore } from "@/state/account/state";
import { selectFilteredProfiles } from "@/state/profiles/selectors";

interface SendModalProps {
  accountActions: AccountLogic;
  config: Config;
  children: React.ReactNode;
}

export default function SendModal({
  accountActions,
  config,
  children,
}: SendModalProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [sendStore, actions] = useSend();

  const resolvedTo = sendStore((state) => state.resolvedTo);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      setTimeout(() => {
        actions.clear();
      }, 500);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCancelToSelection = () => {
    actions.cancelToSelection();
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send</DialogTitle>
          </DialogHeader>
          <SendForm
            className="h-full"
            isInModal
            config={config}
            accountActions={accountActions}
            onClose={handleClose}
          />
          <DialogFooter className="pt-2">
            {!resolvedTo ? (
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            ) : (
              <Button onClick={handleCancelToSelection} variant="outline">
                Back
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Send</DrawerTitle>
        </DrawerHeader>
        <SendForm
          className="h-full px-4"
          config={config}
          accountActions={accountActions}
          onClose={handleClose}
        />
        <DrawerFooter className="pt-2">
          {!resolvedTo ? (
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          ) : (
            <Button onClick={handleCancelToSelection} variant="outline">
              Back
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface SendFormProps {
  isInModal?: boolean;
  config: Config;
  accountActions: AccountLogic;
  className?: string;
  onClose: () => void;
}

const SendForm = ({
  isInModal = false,
  config,
  accountActions,
  className,
  onClose,
}: SendFormProps) => {
  const divHeight =
    typeof window !== "undefined"
      ? isInModal
        ? window.innerHeight * 0.6
        : window.innerHeight
      : 200;

  const { token } = config;

  const [sendStore, actions] = useSend();
  const [profilesStore, profilesActions] = useProfiles(config);

  const balance = useAccountStore((state) => state.balance);

  const to = sendStore((state) => state.to);
  const amount = sendStore((state) => state.amount);
  const description = sendStore((state) => state.description);
  const resolvedTo = sendStore((state) => state.resolvedTo);
  const profiles = profilesStore((state) => state.profiles);
  const profileList = profilesStore(selectFilteredProfiles(to));

  const handleSearchProfile = (query: string) => {
    profilesActions.debouncedLoadProfileFromUsername(query);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const to = e.target.value;
    actions.updateTo(to);
    handleSearchProfile(to);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    actions.updateAmount(formatCurrency(amount, token.decimals > 0));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const description = e.target.value;
    actions.updateDescription(description);
  };

  const handleProfileSelect = (profile: Profile) => {
    actions.updateResolvedTo(profile.account);
  };

  const handleScan = (data: string) => {
    if (data) {
      const to = actions.parseQRCode(data);
      if (to) {
        profilesActions.loadProfile(to);
      }
    }
  };

  const handleSend = () => {
    if (!resolvedTo) return;
    accountActions.send(resolvedTo, amount, description);

    onClose();
  };

  let modalContent = (
    <Box key="to" className="animate-fade-in w-full">
      <Box className="relative w-full h-14 my-4">
        <Input
          type="search"
          id="search"
          autoFocus
          placeholder="Search user of paste address"
          className="rounded-full pl-5 pr-5 w-full h-14 text-base focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary"
          value={to}
          onChange={handleToChange}
        />
        {!to && <SearchIcon className="text-primary absolute top-4 right-4" />}
      </Box>

      <Flex className="w-full h-10">
        <QRScannerModal onScan={handleScan}>
          <Button variant="ghost" className="flex justify-start w-full">
            <QrCodeIcon size={24} className="text-primary mr-4" />
            <Text>Scan QR Code</Text>
          </Button>
        </QRScannerModal>
      </Flex>
      <Flex
        direction="column"
        className="w-full gap-4"
        style={{ height: divHeight - 250 }}
      >
        <ScrollArea className="w-full">
          <Box className="z-10 absolute top-0 left-0 bg-transparent-to-white h-10 w-full"></Box>
          <Box className="h-4"></Box>
          <Box>
            {profileList.map((profile) => (
              <ProfileRow
                key={profile.account}
                profile={profile}
                onSelect={handleProfileSelect}
              />
            ))}
          </Box>
          <Box className="h-4"></Box>
          <Box className="z-10 absolute bottom-0 left-0 w-full bg-transparent-from-white h-10 w-full"></Box>
        </ScrollArea>
      </Flex>
    </Box>
  );

  if (resolvedTo) {
    const profile = profiles[resolvedTo] ?? getEmptyProfile(resolvedTo);

    modalContent = (
      <ScrollArea key="amount" className="animate-fade-in w-full">
        <Flex justify="center" align="center" className="w-full">
          <ProfileRow fullWidth={false} profile={profile} />
        </Flex>

        <Flex align="center" className="relative w-full h-14 pl-10 pr-10">
          <Text>Send</Text>
          <Input
            type="number"
            id="amount"
            autoFocus
            placeholder="0.00"
            className="text-primary border-primary border-0 rounded-none border-b-2 ml-2 mr-2 pl-5 pr-5 w-full h-14 text-4xl text-center focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:ring-transparent"
            value={amount}
            onChange={handleAmountChange}
          />
          <Text size="6" weight="bold" className="font-bold">
            {token.symbol}
          </Text>
        </Flex>
        <Flex justify="center" align="center" className="w-full">
          <Text>
            Current Balance: {balance} {token.symbol}
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
        <Box className="h-20" />
      </ScrollArea>
    );
  }

  return (
    <Flex
      direction="column"
      className={cn(
        "relative w-full items-start gap-4 overflow-hidden",
        className
      )}
    >
      {modalContent}

      {resolvedTo && (
        <Flex
          justify="center"
          align="start"
          className="absolute bottom-0 left-0 w-full px-4"
        >
          <Button onClick={handleSend} className="w-full">
            Send
            <ArrowRightIcon size={24} className="ml-4" />
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
