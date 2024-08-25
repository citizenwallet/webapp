import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/mediaQuery";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Flex, Text } from "@radix-ui/themes";
import { Config, Voucher } from "@citizenwallet/sdk";
import { DialogClose } from "@radix-ui/react-dialog";
import { VoucherActions } from "@/state/voucher/actions";
import { useProfilesStore } from "@/state/profiles/state";
import ProfileRow from "@/components/profiles/ProfileRow";
import { useVoucherStore } from "@/state/voucher/state";
import { ArrowDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Spinner from "@/components/Spinner";
import { useAccountStore } from "@/state/account/state";

interface VoucherModalProps {
  config: Config;
  actions: VoucherActions;
}

export default function VoucherModal({ config, actions }: VoucherModalProps) {
  const { toast } = useToast();

  const state = useVoucherStore;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const account = useAccountStore((state) => state.account);

  const open = state((state) => state.modalOpen);

  const loading = state((state) => state.loading);
  const claiming = state((state) => state.claiming);
  const voucher = state((state) => state.voucher);
  const balance = state((state) => state.balance);

  const hasBalance = parseFloat(balance) > 0;

  const handleClaimVoucher = async (voucher: Voucher | null) => {
    if (!voucher) return;

    const claimed = await actions.claimVoucher(account, voucher);
    if (claimed) {
      toast({
        title: "Voucher claimed",
        duration: 5000,
      });
    } else {
      toast({
        title: "Failed to claim voucher",
        duration: 5000,
        variant: "destructive",
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => handleClaimVoucher(voucher)}
          >
            Try again
          </ToastAction>
        ),
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    actions.setModalOpen(open);
    if (!open) {
      setTimeout(() => {
        actions.clear();
      }, 500);
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{voucher?.name ?? "Voucher"}</DialogTitle>
          </DialogHeader>
          <VoucherContent
            config={config}
            voucher={voucher}
            hasBalance={hasBalance}
            className="h-full"
          />
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            {hasBalance && !loading && (
              <Button
                onClick={
                  !claiming ? () => handleClaimVoucher(voucher) : undefined
                }
                disabled={claiming}
              >
                Claim
                {claiming ? (
                  <Spinner containerClassName="ml-2" className="text-white" />
                ) : (
                  <ArrowDown size={24} className="ml-2" />
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{voucher?.name ?? "Voucher"}</DrawerTitle>
        </DrawerHeader>
        <VoucherContent
          config={config}
          voucher={voucher}
          hasBalance={hasBalance}
          className="h-full px-4"
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
          {hasBalance && !loading && (
            <Button
              onClick={
                !claiming ? () => handleClaimVoucher(voucher) : undefined
              }
              disabled={claiming}
            >
              Claim
              {claiming ? (
                <Spinner containerClassName="ml-2" className="text-white" />
              ) : (
                <ArrowDown size={24} className="ml-2" />
              )}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface VoucherContentProps {
  config: Config;
  voucher: Voucher | null;
  hasBalance: boolean;
  className?: string;
}

const VoucherContent = ({
  config,
  voucher,
  hasBalance = true,
  className,
}: VoucherContentProps) => {
  const balance = useVoucherStore((state) => state.balance);

  const profile = useProfilesStore(
    (state) => voucher && state.profiles[voucher.creator]
  );

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      className={cn(
        "relative w-full items-start gap-4 overflow-hidden",
        className
      )}
    >
      {profile && <ProfileRow profile={profile} fullWidth={false} />}

      {hasBalance ? (
        <Text size="6" weight="bold" className="text-center">
          {balance} {config.token.symbol}
        </Text>
      ) : (
        <Text size="6" weight="bold" className="text-center">
          Already claimed
        </Text>
      )}
    </Flex>
  );
};
