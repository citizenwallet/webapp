"use client";

import { Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Config } from "@citizenwallet/sdk";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTransition } from "react";
import {
  generatePasskeyRegistrationOptionsAction,
  verifyPasskeyRegistrationAction,
  verifyPasskeyAuthenticationAction,
  generatePasskeyAuthenticationOptionsAction,
} from "@/app/signin/actions";
import { toast } from "@/components/ui/use-toast";
import * as simpleWebAuthn from "@simplewebauthn/browser";
import { useSessionStore } from "@/state/session/state";
import { SessionLogic } from "@/state/session/action";
import { WebAuthnCredential } from "@simplewebauthn/server";

interface SignInEmailProps {
  config: Config;
}

export default function SignInEmail({ config }: SignInEmailProps) {
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);

  const [isRegisteringPasskey, startRegisterPasskey] = useTransition();
  const [isSigningInPasskey, startSignInPasskey] = useTransition();

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

        toast({
          variant: "success",
          title: "Passkey authenticated",
          description: "You have been signed in.",
        });

        sessionLogic.storePasskey(credential);
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

        toast({
          variant: "success",
          title: "Passkey authenticated",
          description: "You have been signed in.",
        });
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

  if (!isPasskeySupported) {
    return null;
  }

  return (
    <Button
      onClick={handlePasskey}
      variant="outline"
      style={style}
      disabled={isRegisteringPasskey || isSigningInPasskey}
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
      {isRegisteringPasskey || isSigningInPasskey ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Key className="h-4 w-4" />
      )}
      <span>Sign in with Passkey</span>
    </Button>
  );
}
