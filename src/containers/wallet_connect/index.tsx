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
import { CWAccount } from "@/services/account";
import { toUtf8String } from "ethers";

interface SessionProposalModal {
  open: boolean;
  params: ProposalTypes.Struct | null;
}

interface PersonalSignModal {
  open: boolean;
  event: WalletKitTypes.SessionRequest | null;
}

interface SessionAuthenticateModal {
  open: boolean;
  message: string | null;
}

interface ContainerProps {
  account: string;
  wallet?: CWAccount;
}

export default function Container({ account, wallet }: ContainerProps) {
  const walletKit = WalletKitService.getWalletKit();
  const [_, actions] = useWalletKit();

  const [sessionProposalModal, setSessionProposalModal] =
    React.useState<SessionProposalModal>({
      open: false,
      params: null,
    });

  const [personalSignModal, setPersonalSignModal] =
    React.useState<PersonalSignModal>({
      open: false,
      event: null,
    });

  const [sessionAuthenticateModal, setSessionAuthenticateModal] =
    React.useState<SessionAuthenticateModal>({
      open: false,
      message: null,
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

  const onSessionRequest = React.useCallback(
    async (event: WalletKitTypes.SessionRequest) => {
      const method = event.params.request.method;
      if (method === "personal_sign") {
        setPersonalSignModal({
          open: true,
          event,
        });
        return;
      }
    },
    []
  );

  const onSessionAuthenticate = React.useCallback(
    async (event: WalletKitTypes.SessionAuthenticate) => {
      const authParams = event.params.authPayload;
      const message =
        WalletKitService.populateAuthPayload(authParams, account) || "";
      console.log("message", message);

      setSessionAuthenticateModal({
        open: true,
        message,
      });
    },
    [account]
  );

  useSafeEffect(() => {
    if (!walletKit) return;

    // get current active sessions when loaded
    const activeSessions = walletKit.getActiveSessions();
    actions.setActiveSessions(activeSessions);

    walletKit.on("session_delete", onSessionDisconnect);
    walletKit.on("session_proposal", onSessionProposal);
    walletKit.on("session_request", onSessionRequest);
    walletKit.on("session_authenticate", onSessionAuthenticate);

    return () => {
      walletKit.off("session_proposal", onSessionProposal);
      walletKit.off("session_delete", onSessionDisconnect);
      walletKit.off("session_request", onSessionRequest);
      walletKit.off("session_authenticate", onSessionAuthenticate);
    };
  }, [walletKit, onSessionProposal, onSessionDisconnect, onSessionRequest]);

  return (
    <React.Fragment>
      <SessionProposalModal
        account={account}
        modal={sessionProposalModal}
        setModal={setSessionProposalModal}
      />
      {wallet && (
        <PersonalSignModal
          wallet={wallet}
          modal={personalSignModal}
          setModal={setPersonalSignModal}
        />
      )}
      <SessionAuthenticateModal
        modal={sessionAuthenticateModal}
        setModal={setSessionAuthenticateModal}
      />
    </React.Fragment>
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

interface PersonalSignModalProps {
  modal: PersonalSignModal;
  setModal: React.Dispatch<React.SetStateAction<PersonalSignModal>>;
  wallet: CWAccount;
}

function PersonalSignModal({
  modal,
  setModal,
  wallet,
}: PersonalSignModalProps) {
  const { event } = modal;
  const walletKit = WalletKitService.getWalletKit();
  const [isSigning, setIsSigning] = React.useState(false);
  const { toast } = useToast();

  if (!event || !walletKit) return null;

  const messageHex = event.params.request.params[0];
  const id = event.id;
  const topic = event.topic;
  const message = toUtf8String(messageHex);

  const onApproveSign = async () => {
    setIsSigning(true);
    try {
      const signedMessage = await wallet.signer.signMessage(message);
      const response = { id, result: signedMessage, jsonrpc: "2.0" };

      await walletKit.respondSessionRequest({ topic, response });
      toast({
        title: "Success",
        variant: "success",
      });
    } catch (error) {
      console.error("Error signing message", error);
      toast({
        title: "Signing failed",
        description: "Unable to sign message",
        variant: "destructive",
      });
    } finally {
      setIsSigning(false);
      setModal({ open: false, event: null });
    }
  };

  const onRejectSign = async () => {
    try {
      const response = {
        id,
        jsonrpc: "2.0",
        error: {
          code: 5000,
          message: "User rejected.",
        },
      };
      await walletKit.respondSessionRequest({ topic, response });
      toast({
        title: "Rejected",
        variant: "default",
      });
    } catch (error) {
      console.error("Error rejecting sign", error);
    } finally {
      setModal({ open: false, event: null });
    }
  };

  return (
    <Dialog
      open={modal.open}
      onOpenChange={() => setModal({ open: false, event: null })}
    >
      <DialogContent className="p-5 border-0 sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Personal sign request</DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col items-center text-center space-y-1">
              <p className="text-gray-500">{message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="w-full rounded-xl"
                onClick={onRejectSign}
                disabled={isSigning}
              >
                Cancel
              </Button>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl"
                onClick={onApproveSign}
                disabled={isSigning}
              >
                {isSigning ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing...
                  </div>
                ) : (
                  "Sign"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

interface SessionAuthenticateModalProps {
  modal: SessionAuthenticateModal;
  setModal: React.Dispatch<React.SetStateAction<SessionAuthenticateModal>>;
}

function SessionAuthenticateModal({
  modal,
  setModal,
}: SessionAuthenticateModalProps) {
  const { message } = modal;
  const [isSigning, setIsSigning] = React.useState(false);

  const onApprove = async () => {
    setModal({ open: false, message: null });
  };

  const onReject = async () => {
    setModal({ open: false, message: null });
  };

  return (
    <Dialog
      open={modal.open}
      onOpenChange={() => setModal({ open: false, message: null })}
    >
      <DialogContent className="p-5 border-0 sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Authenticate request</DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col items-center text-center space-y-1">
              <p className="text-gray-500">{message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="w-full rounded-xl"
                onClick={onReject}
                disabled={isSigning}
              >
                Cancel
              </Button>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl"
                onClick={onApprove}
                disabled={isSigning}
              >
                {isSigning ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating...
                  </div>
                ) : (
                  "Authenticate"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
