"use client";

import * as React from "react";
import { useSafeEffect } from "@/hooks/useSafeEffect";
import { WalletKitTypes } from "@reown/walletkit";
import { ProposalTypes } from "@walletconnect/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ExternalLinkIcon } from "lucide-react";
import { getSdkError } from "@walletconnect/utils";
import WalletKitService from "@/services/walletkit";
import { useWalletKit } from "@/state/wallet_kit/actions";
import { useToast } from "@/components/ui/use-toast";

interface SessionProposalModal {
  open: boolean;
  params: ProposalTypes.Struct | null;
}

interface ContainerProps {
  account: string;
}

export default function Container({ account }: ContainerProps) {
  const walletKit = WalletKitService.getWalletKit();
  const [_, actions] = useWalletKit();

  const [sessionProposalModal, setSessionProposalModal] =
    React.useState<SessionProposalModal>({
      open: false,
      params: null,
    });

  const onSessionProposal = React.useCallback(
    async (proposal: WalletKitTypes.SessionProposal) => {
      const { params } = proposal;
      setSessionProposalModal({
        open: true,
        params,
      });
    },
    []
  );

  const onSessionDisconnect = React.useCallback(async () => {
    if (!walletKit) return;

    // update active sessions after a session is disconnected
    const activeSessions = walletKit.getActiveSessions();
    actions.setActiveSessions(activeSessions);
  }, [walletKit, actions]);

  useSafeEffect(() => {
    if (!walletKit) return;

    // get current active sessions when loaded
    const activeSessions = walletKit.getActiveSessions();
    actions.setActiveSessions(activeSessions);

    walletKit.on("session_delete", onSessionDisconnect);
    walletKit.on("session_proposal", onSessionProposal);

    return () => {
      walletKit.off("session_proposal", onSessionProposal);
      walletKit.off("session_delete", onSessionDisconnect);
    };
  }, [walletKit, onSessionProposal, onSessionDisconnect]);

  return (
    <SessionProposalModal
      account={account}
      modal={sessionProposalModal}
      setModal={setSessionProposalModal}
    />
  );
}

interface SessionProposalModalProps {
  modal: SessionProposalModal;
  setModal: React.Dispatch<React.SetStateAction<SessionProposalModal>>;
  account: string;
}

function SessionProposalModal({
  modal,
  setModal,
  account,
}: SessionProposalModalProps) {
  const { params } = modal;
  const walletKit = WalletKitService.getWalletKit();
  const [_, actions] = useWalletKit();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = React.useState(false);

  if (!params || !walletKit) return null;

  const {
    proposer: { metadata },
  } = params;

  const icon = metadata?.icons.find((icon) => icon.endsWith(".png"));
  const name = metadata?.name;
  const url = metadata?.url;
  const description = metadata?.description;

  const onApproveSession = async () => {
    const namespaces = WalletKitService.buildNamespaces(params, account);

    setIsConnecting(true);
    try {
      await walletKit.approveSession({
        id: params.id,
        namespaces,
      });

      const sessions = walletKit.getActiveSessions();
      actions.setActiveSessions(sessions);

      toast({
        title: "Connected successfully",
        description: "Your wallet is now connected",
        variant: "success",
      });
    } catch (error) {
      console.error("Error approving session", error);
      toast({
        title: "Connection failed",
        description: "Unable to connect to wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
      setModal({
        open: false,
        params: null,
      });
    }
  };

  const onRejectSession = async () => {
    try {
      await walletKit.rejectSession({
        id: params.id,
        reason: getSdkError("USER_REJECTED"),
      });
      toast({
        title: "Connection rejected",
        description: "You have rejected the connection request",
        variant: "default",
      });
    } catch (error) {
      console.error("Error rejecting session", error);
    } finally {
      setModal({
        open: false,
        params: null,
      });
    }
  };

  return (
    <Dialog
      open={modal.open}
      onOpenChange={() => setModal({ open: false, params: null })}
    >
      <DialogContent className="p-5 border-0 sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Connect to {name}</DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col items-center text-center space-y-1">
              <Avatar className="h-28 w-28">
                <AvatarImage src={icon} alt="dApp logo" />
              </Avatar>
              <h2 className="text-xl font-semibold mt-4">
                {name} wants to connect
              </h2>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer bg-blue-100 hover:bg-gray-200 px-3 py-1 rounded-full"
              >
                <p>{url}</p>
                <ExternalLinkIcon size={16} />
              </a>
              <p className="text-gray-500">{description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="w-full rounded-xl"
                onClick={onRejectSession}
                disabled={isConnecting}
              >
                Cancel
              </Button>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl"
                onClick={onApproveSession}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Connecting...
                  </div>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
