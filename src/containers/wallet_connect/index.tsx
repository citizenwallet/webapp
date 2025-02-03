"use client";

import * as React from "react";
import { useSafeEffect } from "@/hooks/useSafeEffect";
import { WalletKitTypes } from "@reown/walletkit";
import { ProposalTypes } from "@walletconnect/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  ExternalLinkIcon,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { getSdkError } from "@walletconnect/utils";
import WalletKitService from "@/services/walletkit";
import { useWalletKit } from "@/state/wallet_kit/actions";
import { useToast } from "@/components/ui/use-toast";
import { CWAccount } from "@/services/account";
import { toUtf8String, ethers } from "ethers";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatAddress } from "@/utils/formatting";

interface SessionProposalModal {
  open: boolean;
  params: ProposalTypes.Struct | null;
}

interface PersonalSignModal {
  open: boolean;
  event: WalletKitTypes.SessionRequest | null;
}

interface TransactionSignModal {
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

  const [transactionSignModal, setTransactionSignModal] =
    React.useState<TransactionSignModal>({
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
      console.log("event", JSON.stringify(event));

      const method = event.params.request.method;
      if (method === "personal_sign") {
        setPersonalSignModal({
          open: true,
          event,
        });
        return;
      }

      if (method === "eth_sendTransaction") {
        setTransactionSignModal({
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
      {wallet && (
        <TransactionSignModal
          wallet={wallet}
          modal={transactionSignModal}
          setModal={setTransactionSignModal}
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
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer bg-blue-100 hover:bg-gray-200 px-3 py-1 rounded-md"
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
  const message = toUtf8String(messageHex);

  const account = event.params.request.params[1]; // an hex address

  const id = event.id;
  const topic = event.topic;

  const isScam = event.verifyContext.verified.isScam ?? false;
  const url = event.verifyContext.verified.origin;
  const validation = event.verifyContext.verified.validation;

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

  const config = getStatusConfig({ isScam, validation });

  return (
    <Dialog
      open={modal.open}
      onOpenChange={() => setModal({ open: false, event: null })}
    >
      <DialogContent className="h-[70vh] sm:h-auto sm:min-h-[300px] max-h-[80vh] flex flex-col p-0 border-0 sm:max-w-md w-full">
        <DialogHeader className="bg-background px-4 sm:px-6 py-4 border-b">
          <DialogTitle className="text-lg sm:text-xl">
            Personal sign request
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-center text-sm font-medium text-muted-foreground">
                Origin
              </span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm"
              >
                <span>{url}</span>
                <ExternalLinkIcon size={14} />
              </a>
            </div>

            <Alert variant={config.variant}>
              <config.icon className="h-4 w-4" />
              <AlertTitle>{config.title}</AlertTitle>
              <AlertDescription>{config.description}</AlertDescription>
            </Alert>

            <div className="grid gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea
                className="shadow-none bg-gray-50"
                value={message}
                readOnly
                id="message"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="bg-background px-4 sm:px-6 py-4 border-t">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="secondary"
              className="w-full rounded-xl text-sm"
              onClick={onRejectSign}
              disabled={isSigning}
            >
              Cancel
            </Button>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl text-sm"
              onClick={onApproveSign}
              disabled={isSigning}
            >
              {isSigning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing...</span>
                </div>
              ) : (
                "Sign"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TransactionSignModalProps {
  modal: TransactionSignModal;
  setModal: React.Dispatch<React.SetStateAction<TransactionSignModal>>;
  wallet: CWAccount;
}
interface EncodedTransaction {
  to: string;
  from: string;
  data: string;
  gas: string;
}

function TransactionSignModal({
  modal,
  setModal,
  wallet,
}: TransactionSignModalProps) {
  const { event } = modal;
  const walletKit = WalletKitService.getWalletKit();
  const [isSigning, setIsSigning] = React.useState(false);
  const { toast } = useToast();

  if (!event || !walletKit) return null;

  const encodedTransaction = event.params.request
    .params[0] as EncodedTransaction;
  const functionSignature = encodedTransaction.data.slice(0, 10);

  const id = event.id;
  const topic = event.topic;

  const isScam = event.verifyContext.verified.isScam ?? false;
  const url = event.verifyContext.verified.origin;
  const validation = event.verifyContext.verified.validation;

  const onApproveSign = async () => {
    setIsSigning(true);
    try {
      const hash = await wallet.call(
        encodedTransaction.to,
        encodedTransaction.data
      );

      const response = { id, result: hash, jsonrpc: "2.0" };

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

  const config = getStatusConfig({ isScam, validation });

  return (
    <Dialog
      open={modal.open}
      onOpenChange={() => setModal({ open: false, event: null })}
    >
      <DialogContent className="h-[70vh] sm:h-auto sm:min-h-[300px] max-h-[80vh] flex flex-col p-0 border-0 sm:max-w-md w-full">
        <DialogHeader className="bg-background px-4 sm:px-6 py-4 border-b">
          <DialogTitle className="text-lg sm:text-xl">
            Transaction sign request
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-center text-sm font-medium text-muted-foreground">
                Origin
              </span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm"
              >
                <span>{url}</span>
                <ExternalLinkIcon size={14} />
              </a>
            </div>

            <Alert variant={config.variant}>
              <config.icon className="h-4 w-4" />
              <AlertTitle>{config.title}</AlertTitle>
              <AlertDescription>{config.description}</AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <dt className="col-span-1 text-sm font-medium text-muted-foreground">
                Function signature
              </dt>
              <dd className="col-span-1 text-sm break-all">
                {functionSignature}
              </dd>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <dt className="col-span-1 text-sm font-medium text-muted-foreground truncate">
                To
              </dt>
              <dd className="col-span-1 text-sm break-all">
                {formatAddress(encodedTransaction.to)}
              </dd>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <dt className="col-span-1 text-sm font-medium text-muted-foreground truncate">
                From
              </dt>
              <dd className="col-span-1 text-sm break-all">
                {formatAddress(encodedTransaction.from)}
              </dd>
            </div>
          </div>
        </div>
        <DialogFooter className="bg-background px-4 sm:px-6 py-4 border-t">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="secondary"
              className="w-full rounded-xl text-sm"
              onClick={onRejectSign}
              disabled={isSigning}
            >
              Cancel
            </Button>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl text-sm"
              onClick={onApproveSign}
              disabled={isSigning}
            >
              {isSigning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing...</span>
                </div>
              ) : (
                "Sign"
              )}
            </Button>
          </div>
        </DialogFooter>
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

const getStatusConfig = (status: { isScam: boolean; validation: string }) => {
  if (status.isScam) {
    return {
      icon: ShieldAlert,
      title: "Security Threat Detected",
      description:
        "This domain has been flagged as malicious and potentially harmful.",
      variant: "destructive" as const,
      badge: "THREAT",
    };
  }

  switch (status.validation) {
    case "VALID":
      return {
        icon: ShieldCheck,
        title: "Domain Verified",
        description:
          "The domain has been verified as this application's domain.",
        variant: "success" as const,
        badge: "VALID",
      };
    case "INVALID":
      return {
        icon: ShieldAlert,
        title: "Domain Mismatch",
        description:
          "The application's domain doesn't match the sender of this request.",
        variant: "destructive" as const,
        badge: "INVALID",
      };
    case "UNKNOWN":
    default:
      return {
        icon: ShieldQuestion,
        title: "Domain Unverified",
        description: "The domain sending the request cannot be verified.",
        variant: "warning" as const,
        badge: "UNKNOWN",
      };
  }
};
