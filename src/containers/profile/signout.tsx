"use client";

import { CommunityConfig, Config, revokeSession } from "@citizenwallet/sdk";
import { useSigninMethod } from "@/hooks/signin-method";
import { Wallet } from "ethers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthBadge from "./auth-badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useTransition } from "react";
import { useSession } from "@/state/session/action";
import { StorageService } from "@/services/storage";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface PageClientProps {
  config: Config;
}

export default function PageClient({ config }: PageClientProps) {
  const communityConfig = new CommunityConfig(config);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSigningOut, startSignout] = useTransition();
  const [sessionState, sessionActions] = useSession(config);
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
      handleOpenDialog();
    }

    if (["email", "passkey"].includes(authMethod)) {
      signOutSession();
    }
  };

  const signOutLocal = () => {
    handleCloseDialog();
    storageService.deleteKey("hash");
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

      sessionActions.clear();
      storageService.deleteKey("session_private_key");
      storageService.deleteKey("session_source_type");
      storageService.deleteKey("session_source_value");
      storageService.deleteKey("session_hash");
      storageService.deleteKey("session_challenge_hash");
      storageService.deleteKey("session_challenge_expiry");

      router.replace("/");
    });
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
            {isSigningOut
              ? authMethod === "local"
                ? "Deleting Forever..."
                : "Signing out..."
              : authMethod === "local"
                ? "Delete Forever"
                : "Sign Out"}
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
