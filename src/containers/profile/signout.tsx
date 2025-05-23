"use client";

import { CommunityConfig, Config, revokeSession } from "@citizenwallet/sdk";
import { useSigninMethod } from "@/hooks/signin-method";
import { Wallet } from "ethers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthBadge from "./auth-badge";
import { Button } from "@/components/ui/button";
import { Check, Copy, LogOut } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRef, useState, useTransition } from "react";
import { useSession } from "@/state/session/action";
import { StorageService } from "@/services/storage";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAccount } from "@/state/account/actions";
import { useProfiles } from "@/state/profiles/actions";
import { useReceive } from "@/state/receive/actions";
import { useSend } from "@/state/send/actions";
import { useVoucher } from "@/state/voucher/actions";
import { useWalletKit } from "@/state/wallet_kit/actions";
import { getBaseUrl } from "@/utils/deeplink";
import { Input } from "@/components/ui/input";

interface PageClientProps {
  config: Config;
}

export default function PageClient({ config }: PageClientProps) {
  const communityConfig = new CommunityConfig(config);

  const baseUrl = getBaseUrl();

  const inputRef = useRef<HTMLInputElement>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSigningOut, startSignout] = useTransition();
  const [localAccountUrl, setLocalAccountUrl] = useState<string | undefined>(
    undefined
  );
  const [copyStatus, setCopyStatus] = useState<"copy" | "copied">("copy");

  const [sessionState, sessionActions] = useSession(config);
  const [accountState, accountActions] = useAccount(baseUrl, config);
  const [profilesState, profilesActions] = useProfiles(config);
  const [receiveState, receiveActions] = useReceive();
  const [sendState, sendActions] = useSend();
  const [voucherState, voucherActions] = useVoucher(config);
  const [walletKitState, walletKitActions] = useWalletKit();

  const router = useRouter();
  const storageService = new StorageService(config.community.alias);

  const logoUrl = communityConfig.community.logo;
  const communityName = communityConfig.community.name;
  const tokenSymbol = communityConfig.primaryToken.symbol;

  const { authMethod } = useSigninMethod(config);

  const getAuthMethodName = () => {
    switch (authMethod) {
      case "email":
        return "email";
      case "passkey":
        return "passkey";
      case "local":
        return "local account";
      default:
        return "email";
    }
  };

  const handleSignOut = () => {
    if (authMethod === "local") {
      const hash = storageService.getKey("hash");
      const localAccountUrl = `${baseUrl}/${hash}`;
      setLocalAccountUrl(localAccountUrl);
      handleOpenDialog();
    }

    if (["email", "passkey"].includes(authMethod)) {
      signOutSession();
    }
  };

  const copyToClipboard = () => {
    if (inputRef.current) {
      inputRef.current.select();
      navigator.clipboard.writeText(inputRef.current.value);
      setCopyStatus("copied");

      // Reset back to "Copy" after 2 seconds
      setTimeout(() => {
        setCopyStatus("copy");
      }, 2000);
    }
  };

  const signOutLocal = () => {
    handleCloseDialog();

    storageService.deleteKey("hash");
    clearState();
    router.replace("/");
  };

  const signOutSession = () => {
    startSignout(async () => {
      const privateKey = sessionActions.storage.getKey("session_private_key");
      const account = await sessionActions.getAccountAddress();

      if (!privateKey || !account) {
        return;
      }

      const signer = new Wallet(privateKey);

      const tx = await revokeSession({
        community: communityConfig,
        signer,
        account,
      });

      if (!tx) {
        toast({
          variant: "destructive",
          title: "Signout failed",
          description: "Please try again.",
        });
        return;
      }

      clearState();
      storageService.deleteKey("session_private_key");
      storageService.deleteKey("session_source_type");
      storageService.deleteKey("session_source_value");
      storageService.deleteKey("session_hash");
      storageService.deleteKey("session_challenge_hash");
      storageService.deleteKey("session_challenge_expiry");

      router.replace("/");
    });
  };

  const clearState = () => {
    sessionActions.clear();
    accountActions.clear();
    profilesActions.clear();
    receiveActions.clear();
    sendActions.clear();
    voucherActions.clear();
    walletKitActions.clear();
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="w-full flex flex-col items-center gap-6">
        <div className="flex justify-center">
          <div className="relative inline-flex">
            <Avatar className="h-24 w-24 border-2 border-muted bg-background">
              <AvatarImage
                src={logoUrl || "/placeholder.svg"}
                alt={communityName}
                className="object-contain p-1"
              />
              <AvatarFallback>{tokenSymbol}</AvatarFallback>
            </Avatar>

            <AuthBadge authMethod={authMethod} config={config} />
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-center gap-2 items-center">
            <p className="text-lg font-medium">You are signed in with</p>
            <p className="text-lg font-medium">{getAuthMethodName()}</p>
          </div>
        </div>

        <div className="w-full">
          <Button
            variant={authMethod === "local" ? "destructive" : "secondary"}
            className="w-full"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </div>

      {/* confirmation for local account */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Forever</DialogTitle>
            <DialogDescription>
              This will clear all data on this page and log you out forever.
            </DialogDescription>
          </DialogHeader>

          <div className="flex rounded-md overflow-hidden mt-2 bg-slate-100 dark:bg-slate-800 border">
            <Input
              ref={inputRef}
              readOnly
              value={localAccountUrl}
              className="border-0 bg-transparent font-mono text-sm flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              size="sm"
              variant="ghost"
              className="rounded-none h-10 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              onClick={copyToClipboard}
            >
              {copyStatus === "copy" ? (
                <>
                  <Copy className="mr-1.5 h-4 w-4" />
                  <span>Copy</span>
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  <span>Copied</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Copy and save your account to log in later
          </p>

          <DialogFooter className="sm:justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSigningOut}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={isSigningOut}
              onClick={signOutLocal}
              type="button"
              variant="destructive"
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
