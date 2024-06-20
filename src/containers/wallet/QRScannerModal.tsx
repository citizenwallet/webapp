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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Box, Flex } from "@radix-ui/themes";
import { useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import QRScanner from "@/components/QRScanner";

interface QRScannerModalProps {
  onScan: (data: string) => void;
  children: React.ReactNode;
}

export default function QRScannerModal({
  onScan,
  children,
}: QRScannerModalProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleScan = (data: string) => {
    setOpen(false);
    onScan(data);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="h-4/6 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send</DialogTitle>
          </DialogHeader>
          <QRScannerContent className="h-full" onScan={handleScan} />
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-4/6">
        <DrawerHeader className="text-left">
          <DrawerTitle>Send</DrawerTitle>
        </DrawerHeader>
        <QRScannerContent className="h-full px-4" onScan={handleScan} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface QRScannerContentProps {
  className?: string;
  onScan: (data: string) => void;
}

const QRScannerContent = ({ className, onScan }: QRScannerContentProps) => {
  return (
    <Flex
      direction="column"
      className={cn("w-full items-start gap-4 overflow-hidden", className)}
    >
      <Box className="h-full w-full overflow-hidden rounded-lg">
        <QRScanner onScan={onScan} />
      </Box>
    </Flex>
  );
};
