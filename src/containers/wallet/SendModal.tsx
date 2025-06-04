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
import { ArrowRightIcon, QrCodeIcon, SearchIcon } from "lucide-react";
import { useSendStore } from "@/state/send/state";
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes";
import ProfileRow from "@/components/profiles/ProfileRow";
import { getEmptyProfile, useProfilesStore } from "@/state/profiles/state";
import { Config, Profile } from "@citizenwallet/sdk";
import { useSend } from "@/state/send/actions";
import { DialogClose } from "@radix-ui/react-dialog";
import QRScannerModal from "../../components/qr/QRScannerModal";
import { formatAddress, formatCurrency } from "@/utils/formatting";
import { useProfiles } from "@/state/profiles/actions";
import { AccountLogic } from "@/state/account/actions";
import { useAccountStore } from "@/state/account/state";
import { selectFilteredProfiles } from "@/state/profiles/selectors";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { selectCanSend } from "@/state/send/selectors";
import { scrollToTop } from "@/utils/window";
import { CommunityConfig } from "@citizenwallet/sdk";
import { useState } from "react";

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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const communityConfig = new CommunityConfig(config);
  const primaryToken = communityConfig.primaryToken;

  const { toast } = useToast();

  const amount = useSendStore((state) => state.amount);
  const description = useSendStore((state) => state.description);
  const profiles = useProfilesStore((state) => state.profiles);

  const balance = useAccountStore((state) => state.balance);
  const isSending = useAccountStore((state) => state.sending);

  const canSend = useSendStore(selectCanSend(balance));

  const [sendStore, actions] = useSend();

  const modalOpen = sendStore((state) => state.modalOpen);
  const resolvedTo = sendStore((state) => state.resolvedTo);

  const handleOpenChange = (open: boolean) => {
    actions.setModalOpen(open);

    if (!open) {
      setTimeout(() => {
        actions.clear();
      }, 500);
    }
  };

  const handleClose = () => {
    actions.setModalOpen(false);
  };

  const handleCancelToSelection = () => {
    actions.cancelToSelection();
  };

  const handleSend = async (
    sendTo: string,
    sendAmount: string,
    sendDescription?: string,
  ) => {
    if (!resolvedTo) return;

   
    const tx = await accountActions.send(sendTo, sendAmount, sendDescription);
   

    if (tx) {
      // send toast
      const profile = profiles[sendTo];
      let toastDescription = `Sent ${sendAmount} ${
        primaryToken.symbol
      } to ${formatAddress(sendTo)}`;
      if (profile) {
        toastDescription = `Sent ${sendAmount} ${primaryToken.symbol} to ${profile.username}`;
      }

      toast({
        title: "Sent",
        description: toastDescription,
        duration: 5000,
      });
    } else {
      toast({
        title: `Failed to send ${primaryToken.symbol}`,
        duration: 5000,
        variant: "destructive",
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => handleSend(sendTo, sendAmount, sendDescription)}
            disabled={isSending}
          >
            Try again
          </ToastAction>
        ),
      });
    }

    handleClose();

    scrollToTop();
  };

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          "h-full flex flex-col",
          isDesktop ? "sm:max-w-[425px] max-h-[750px]" : "",
        )}
      >
        <DialogHeader>
          <DialogTitle>Send</DialogTitle>
        </DialogHeader>
        <SendForm className="flex-1 px-4" config={config} />
        <DialogFooter className="pt-2 gap-2">
          {!resolvedTo ? (
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          ) : (
            <Button onClick={handleCancelToSelection} variant="outline">
              Back
            </Button>
          )}
          {resolvedTo && canSend && (
            <Flex justify="center" align="start">
              <Button
                onClick={() => handleSend(resolvedTo, amount, description)}
                className="w-full"
                disabled={isSending}
              >
                Send
                <ArrowRightIcon size={24} className="ml-4" />
              </Button>
            </Flex>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SendFormProps {
  config: Config;
  className?: string;
}

const SendForm = ({ config, className }: SendFormProps) => {
  const communityConfig = new CommunityConfig(config);
  const primaryToken = communityConfig.primaryToken;

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
    actions.updateAmount(formatCurrency(amount, primaryToken.decimals > 0));
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

  let modalContent = (
    <Box key="to" className="animate-fade-in flex flex-col flex-1 w-full">
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
      <Flex direction="column" className="w-full flex flex-col flex-1 gap-4">
        <Box className="z-10 absolute top-0 left-0 bg-transparent-to-white h-10 w-full"></Box>
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
            {primaryToken.symbol}
          </Text>
        </Flex>
        <Flex justify="center" align="center" className="w-full">
          <Text>
            Current Balance: {balance} {primaryToken.symbol}
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
        "relative h-full flex flex-col items-start overflow-y-auto gap-4",
        className,
      )}
    >
      {modalContent}
    </Flex>
  );
};
