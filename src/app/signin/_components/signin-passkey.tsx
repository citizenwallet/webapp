"use client";

import { Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityConfig, Config, waitForTxSuccess } from "@citizenwallet/sdk";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTransition } from "react";
import {
  generatePasskeyRegistrationOptionsAction,
  verifyPasskeyRegistrationAction,
  verifyPasskeyAuthenticationAction,
  generatePasskeyAuthenticationOptionsAction,
  requestSessionAction,
  confirmSessionAction,
} from "@/app/signin/actions";
import { toast } from "@/components/ui/use-toast";
import * as simpleWebAuthn from "@simplewebauthn/browser";
import { useSessionStore } from "@/state/session/state";
import { SessionLogic } from "@/state/session/action";
import { WebAuthnCredential } from "@simplewebauthn/server";
import { useRouter } from "next/navigation";

interface SignInEmailProps {
  config: Config;
}

export default function SignInEmail({ config }: SignInEmailProps) {
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);

  const [isRegisteringPasskey, startRegisterPasskey] = useTransition();
  const [isSigningInPasskey, startSignInPasskey] = useTransition();
  const [isRequestingSession, startSessionRequest] = useTransition();

  const router = useRouter();

  const sessionStore = useSessionStore();
  const sessionLogic = new SessionLogic(
    () => useSessionStore.getState(), // Pass getter function instead of state
    config
  );

  const primaryColor = config.community.theme?.primary ?? "#000000";

  const style = {
    backgroundColor: `${primaryColor}1A`, // 10% opacity
    borderColor: `${primaryColor}33`, // 20% opacity
    color: primaryColor,
  };

  useEffect(() => {
    const checkPasskeySupport = () => {
      setIsPasskeySupported(simpleWebAuthn.browserSupportsWebAuthn());
    };

    checkPasskeySupport();

    // Cleanup WebAuthn ceremony when component unmounts
    return () => {
      simpleWebAuthn.WebAuthnAbortService.cancelCeremony();
    };
  }, []);

  const handlePasskey = async () => {
    const passkeys = sessionLogic.getPasskeys();

    // no passkeys registered
    if (passkeys.length === 0) {
      handleRegisterPasskey(passkeys);
      return;
    }

    // offer existing passkeys
    handleAuthenticatePasskey(passkeys);
  };

  const handleRegisterPasskey = async (passkeys: WebAuthnCredential[]) => {
    startRegisterPasskey(async () => {
      try {
        const registrationOptionsJSON =
          await generatePasskeyRegistrationOptionsAction({
            existingPasskeys: passkeys,
          });

        const registrationResponseJSON = await simpleWebAuthn.startRegistration(
          {
            optionsJSON: registrationOptionsJSON,
          }
        );

        if (!registrationResponseJSON) {
          throw new Error("No credential created");
        }

        const verification = await verifyPasskeyRegistrationAction({
          registrationOptions: registrationOptionsJSON,
          resgistrationResponse: registrationResponseJSON,
        });

        if (!verification.verified) {
          throw new Error("Passkey registration failed");
        }

        const credential = verification.registrationInfo?.credential;

        if (!credential) {
          throw new Error("No credential created");
        }

        sessionLogic.storePasskey(credential);

        handleSessionRequest(credential);
      } catch (error) {
        console.error("Passkey registration error:", error);
        if (error instanceof Error) {
          if (
            error.name === "InvalidStateError" // passkey already exists
          ) {
            return; // do nothing for these errors
          }

          if (
            error.name === "NotAllowedError" // user canceled
          ) {
            return; // do nothing for these errors
          }

          if (
            error.name === "AbortError" // operation aborted
          ) {
            return; // do nothing for these errors
          }

          // Handle specific environment variable errors
          if (error.message.includes("environment variable is missing")) {
            toast({
              variant: "destructive",
              title: "Server configuration error",
              description: "Please contact support.",
            });
            return;
          }

          if (error.message.includes("No credential created")) {
            toast({
              variant: "destructive",
              title: "No credential created",
              description: "Please try again.",
            });
            return;
          }

          if (error.message.includes("Passkey registration failed")) {
            toast({
              variant: "destructive",
              title: "Passkey registration failed",
              description: "Please try again later.",
            });
            return;
          }

          toast({
            variant: "destructive",
            title: "Failed to register passkey",
            description: "Please try again later.",
          });
        } else {
          // Handle unknown errors
          toast({
            title: "An unexpected error occurred",
            description: "Please try again.",
          });
        }
      }
    });
  };

  const handleAuthenticatePasskey = async (passkeys: WebAuthnCredential[]) => {
    startSignInPasskey(async () => {
      try {
        const authenticationOptionsJSON =
          await generatePasskeyAuthenticationOptionsAction({
            passkeys,
          });

        const authenticationResponseJSON =
          await simpleWebAuthn.startAuthentication({
            optionsJSON: authenticationOptionsJSON,
          });

        if (!authenticationResponseJSON) {
          throw new Error("No credential created");
        }

        const selectedCredential = passkeys.find(
          (passkey) => passkey.id === authenticationResponseJSON.id
        );

        if (!selectedCredential) {
          throw "Unknow credential selected";
        }

        const verification = await verifyPasskeyAuthenticationAction({
          authenticationOptions: authenticationOptionsJSON,
          authenticationResponse: authenticationResponseJSON,
          selectedCredential: selectedCredential,
        });

        if (!verification.verified) {
          throw new Error("Passkey authentication failed");
        }

        handleSessionRequest(selectedCredential);
      } catch (error) {
        console.error("Passkey authentication error:", error);
        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            // User canceled the operation
            return;
          }

          if (error.name === "AbortError") {
            // Operation was aborted
            return;
          }

          if (error.message.includes("environment variable is missing")) {
            toast({
              variant: "destructive",
              title: "Server configuration error",
              description: "Please contact support.",
            });
            return;
          }

          if (error.message === "No credential created") {
            toast({
              variant: "destructive",
              title: "Authentication failed",
              description: "No credential was provided. Please try again.",
            });
            return;
          }

          if (error.message === "Passkey authentication failed") {
            toast({
              variant: "destructive",
              title: "Authentication failed",
              description:
                "Your passkey could not be verified. Please try again.",
            });
            return;
          }

          toast({
            variant: "destructive",
            title: "Failed to authenticate passkey",
            description: "Please try again later.",
          });
        } else if (error === "Unknow credential selected") {
          toast({
            variant: "destructive",
            title: "Invalid passkey",
            description: "The selected passkey is not recognized.",
          });
        } else {
          // Handle unknown errors
          toast({
            variant: "destructive",
            title: "An unexpected error occurred",
            description: "Please try again.",
          });
        }
      }
    });
  };

  const handleSessionRequest = async (credential: WebAuthnCredential) => {
    startSessionRequest(async () => {
      try {
        const result = await requestSessionAction({
          credential,
          config,
        });

        const sessionRequestSuccessReceipt = await waitForTxSuccess(
          new CommunityConfig(config),
          result.sessionRequestTxHash
        );

        if (!sessionRequestSuccessReceipt) {
          throw new Error("Failed to confirm session request");
        }

        sessionLogic.storePrivateKey(result.privateKey);
        sessionLogic.storeSessionHash(result.hash);
        sessionLogic.storeSourceValue(credential.publicKey.toString());
        sessionLogic.storeSourceType("passkey");
        sessionLogic.storePasskeyChallenge(
          result.challengeHash,
          result.challengeExpiry
        );

        const sessionConfirmResult = await confirmSessionAction({
          privateKey: result.privateKey,
          sessionRequestHash: result.hash,
          sessionChallengeHash: result.challengeHash,
          sessionChallengeExpiry: result.challengeExpiry,
          config,
        });

        const sessionConfirmSuccessReceipt = await waitForTxSuccess(
          new CommunityConfig(config),
          sessionConfirmResult.sessionRequestTxHash
        );

         if (!sessionConfirmSuccessReceipt) {
           throw new Error("Failed to confirm transaction");
         }
        
         const accountAddress = await sessionLogic.getAccountAddress();

         if (!accountAddress) {
           throw new Error("Failed to create account");
         }
        
        router.push(`/${accountAddress}`);

      } catch (error) {
         console.error("Session request error:", error);
         if (error instanceof Error) {
           // Handle environment variable errors
           if (error.message.includes("environment variable is missing")) {
             toast({
               variant: "destructive",
               title: "Server configuration error",
               description: "Please contact support.",
             });
             return;
           }

           // Handle connection request errors
           if (error.message.includes("Invalid connection request")) {
             toast({
               variant: "destructive",
               title: "Invalid session request",
               description: "Missing required parameters. Please try again.",
             });
             return;
           }

           if (error.message.includes("Connection request expired")) {
             toast({
               variant: "destructive",
               title: "Session expired",
               description: "Please try signing in again.",
             });
             return;
           }

           // Handle transaction confirmation errors
           if (error.message.includes("Failed to confirm session request")) {
             toast({
               variant: "destructive",
               title: "Session creation failed",
               description: "Could not create session. Please try again.",
             });
             return;
           }

           if (error.message.includes("Failed to confirm transaction")) {
             toast({
               variant: "destructive",
               title: "Transaction failed",
               description: "Could not confirm session. Please try again.",
             });
             return;
           }

           // Handle account creation errors
           if (error.message.includes("Failed to create account")) {
             toast({
               variant: "destructive",
               title: "Account creation failed",
               description: "Could not create your account. Please try again.",
             });
             return;
           }

           // Handle HTTP errors
           if (error.message.includes("HTTP error!")) {
             toast({
               variant: "destructive",
               title: "Network error",
               description:
                 "Could not connect to the server. Please try again later.",
             });
             return;
           }

           // Default error message
           toast({
             variant: "destructive",
             title: "Failed to create session",
             description: "Please try again later.",
           });
         } else {
           // Handle unknown errors
           toast({
             variant: "destructive",
             title: "An unexpected error occurred",
             description: "Please try again.",
           });
         }
      }
    });
  };

  if (!isPasskeySupported) {
    return null;
  }

  return (
    <Button
      onClick={handlePasskey}
      variant="outline"
      style={style}
      disabled={
        isRegisteringPasskey || isSigningInPasskey || isRequestingSession
      }
      className={cn(
        "inline-flex w-full items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "border",
        "h-11 px-4 py-2",
        "gap-2.5",
        "hover:bg-opacity-20"
      )}
    >
      {isRegisteringPasskey || isSigningInPasskey || isRequestingSession ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Key className="h-4 w-4" />
      )}
      <span>Sign in with Passkey</span>
    </Button>
  );
}
