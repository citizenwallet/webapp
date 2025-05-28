
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
import { useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import NewQrScanner from "@/components/qr/NewQrScanner";

interface QRScannerModalProps {
  title?: string;
  onScan: (data: string) => void;
  children: React.ReactNode;
}

export default function QRScannerModal({
  title = "Scan QR Code",
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="w-full h-full sm:h-auto sm:max-w-md sm:rounded-lg rounded-none p-6 sm:p-6 flex flex-col">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-xl sm:text-lg">{title}</DialogTitle>
        </DialogHeader>

        <div className="w-full flex-1 flex flex-col items-center justify-center">
          {open && <NewQrScanner onScan={handleScan} isActive={open} />}
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Position the QR code within the frame to scan
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-6 sm:mt-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto order-2 sm:order-1 h-11 sm:h-9"
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
