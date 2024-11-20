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
          <svg
            width="28"
            height="28"
            className="text-primary"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m 3 0 c -1.644531 0 -3 1.355469 -3 3 v 6 c 0 1.644531 1.355469 3 3 3 h 3 c 0.550781 0 1 -0.449219 1 -1 s -0.449219 -1 -1 -1 h -3 c -0.570312 0 -1 -0.429688 -1 -1 v -5.796875 l 4.613281 3.074219 c 0.835938 0.558594 1.9375 0.558594 2.773438 0 l 4.613281 -3.074219 v 2.796875 c 0 0.550781 0.449219 1 1 1 s 1 -0.449219 1 -1 v -3 c 0 -1.644531 -1.355469 -3 -3 -3 z m 0.800781 2 h 8.398438 l -3.921875 2.613281 c -0.171875 0.113281 -0.382813 0.113281 -0.554688 0 z m 0 0"
              fill="#222"
            />
            <path
              d="m 8.875 8 c -0.492188 0 -0.875 0.382812 -0.875 0.875 v 6.25 c 0 0.492188 0.382812 0.875 0.875 0.875 h 6.25 c 0.492188 0 0.875 -0.382812 0.875 -0.875 v -6.25 c 0 -0.492188 -0.382812 -0.875 -0.875 -0.875 z m 2.125 1 h 2 v 2.5 s 0 0.5 -0.5 0.5 h -1 c -0.5 0 -0.5 -0.5 -0.5 -0.5 z m 0.5 4 h 1 c 0.277344 0 0.5 0.222656 0.5 0.5 v 1 c 0 0.277344 -0.222656 0.5 -0.5 0.5 h -1 c -0.277344 0 -0.5 -0.222656 -0.5 -0.5 v -1 c 0 -0.277344 0.222656 -0.5 0.5 -0.5 z m 0 0"
              className="warning"
              fill="currentColor"
            />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Account</DialogTitle>
          <DialogDescription>
            Don&apos;t loose access to your account. Bookmark this page or save
            its unique address that contains your private key in a safe place.
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
