import CopyButton from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getWindow } from "@/utils/window";
import { ConfigCommunity } from "@citizenwallet/sdk";
import { Flex, Text } from "@radix-ui/themes";
import { SaveIcon } from "lucide-react";

interface BackupModalProps {
  community: ConfigCommunity;
  account: string;
  url: string;
  className?: string;
}

export default function BackupModal({
  community,
  account,
  url,
  className,
}: BackupModalProps) {
  const handleOpenEmail = () => {
    const emailSubject = `${community.name} Account: ${account}`;
    const emailBody = `Click this link again to access your account: ${url}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    getWindow()?.open(mailtoLink, "_blank");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 w-11 rounded-full p-2 m-4 gap-2 border-primary",
            className
          )}
        >
          <SaveIcon size="28" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Account</DialogTitle>
          <DialogDescription>
            Don't loose access to your account. Bookmark this page or save its
            unique address that contains your private key in a safe place.
          </DialogDescription>
        </DialogHeader>
        <Flex direction="column" align="center" className="grid gap-4 py-4">
          <CopyButton value={url} label="Copy your unique account link" />
          <Text>Or</Text>
          <Button
            variant="outline"
            className="text-lg"
            onClick={handleOpenEmail}
          >
            Email yourself the link
          </Button>
        </Flex>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
