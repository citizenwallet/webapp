"use client";

import { Key } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Config } from "@citizenwallet/sdk";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SignInEmailProps {
  config: Config;
}

export default function SignInEmail({ config }: SignInEmailProps) {
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);
  const primaryColor = config.community.theme?.primary ?? "#000000";

  const style = {
    backgroundColor: `${primaryColor}1A`, // 10% opacity
    borderColor: `${primaryColor}33`, // 20% opacity
    color: primaryColor,
  };

  useEffect(() => {
    const checkPasskeySupport = async () => {
      // Check if the browser supports WebAuthn
      if (
        window.PublicKeyCredential &&
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
        PublicKeyCredential.isConditionalMediationAvailable
      ) {
        try {
          // Check if platform authenticator and conditional mediation are available
          const [hasAuthenticator, hasConditionalMediation] = await Promise.all(
            [
              PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
              PublicKeyCredential.isConditionalMediationAvailable(),
            ]
          );

          setIsPasskeySupported(hasAuthenticator && hasConditionalMediation);
        } catch (error) {
          console.error("Error checking passkey support:", error);
          setIsPasskeySupported(false);
        }
      } else {
        setIsPasskeySupported(false);
      }
    };

    checkPasskeySupport();
  }, []);

  if (!isPasskeySupported) {
    return null;
  }

  return (
    <Button
      variant="outline"
      style={style}
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
      <Key className="h-4 w-4" />
      <span>Sign in with Passkey</span>
    </Button>
  );
}
