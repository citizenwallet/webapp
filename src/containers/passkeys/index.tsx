"use client";
import { Textarea } from "@/components/ui/textarea";
import { Box, Container, Text, Flex } from "@radix-ui/themes";
import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { canGoBack } from "@/utils/history";
import { useRouter } from "next/navigation";
import { PasskeyService } from "@/services/passkeys";
import { useSafeEffect } from "@citizenwallet/sdk";

const Passkeys = () => {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [selectedPasskey, setSelectedPasskey] = useState<string | null>(null);

  const handleBack = () => {
    if (canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  };

  async function onCreatePassKey() {
    PasskeyService.createPasskey();
    checkForPasskeys();
  }

  const signMessage = async () => {
    const signature = await PasskeyService.signMessage();
    console.log("Signed message, signature - ", signature);
    setMessage("");
  };

  async function checkForPasskeys() {
    const options: PublicKeyCredentialRequestOptions = {
      challenge: window.crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [],
      userVerification: "preferred",
    };

    try {
      const credential = await navigator.credentials.get({
        publicKey: options,
      });
      if (credential) {
        setSelectedPasskey(credential.id);
      } else {
        setSelectedPasskey(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useSafeEffect(() => {
    checkForPasskeys();
  }, []);

  return (
    <main
      ref={ref}
      className="flex min-h-screen w-full flex-col align-center p-4 max-w-xl gap-12"
    >
      <Flex className="h-10">
        <ArrowLeft
          className="active:bg-muted rounded-full cursor-pointer"
          onClick={handleBack}
        />
      </Flex>

      <Box className="p-4 border-2 rounded-2xl border-primary">
        <Text size="6" weight="medium">
          Passkeys
        </Text>
        <br />
        {!selectedPasskey && (
          <Container className="m-1">
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={onCreatePassKey}
            >
              Add a new passkey
            </Button>
          </Container>
        )}
        <Container className="mt-3">
          <Text size="3" weight="medium">
            Sign a message with a passkey
          </Text>
          <Textarea
            className="mt-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
          />
          <Button className="w-full mt-3" onClick={signMessage}>
            Sign Message
          </Button>
        </Container>
      </Box>
    </main>
  );
};

export default Passkeys;
