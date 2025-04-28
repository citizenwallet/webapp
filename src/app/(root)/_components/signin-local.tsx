"use client";

import { Loader2 } from "lucide-react";
import { Config } from "@citizenwallet/sdk";
import { cn } from "@/lib/utils";
import { IncognitoIcon } from "@/components/icons";
import { useCallback, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { getBaseUrl } from "@/utils/deeplink";
import { useHash } from "@/hooks/hash";
import { useAccount } from "@/state/account/actions";
import { useRouter } from "next/navigation";

interface SignInLocalProps {
  config: Config;
}

export default function SignInLocal({ config }: SignInLocalProps) {
  const [isLoading, startLoading] = useTransition();

  const baseUrl = getBaseUrl();
  const hash = useHash();
  const [state, actions] = useAccount(baseUrl, config);

  const router = useRouter();

  const primaryColor = config.community.theme?.primary ?? "#000000";

  const style = {
    backgroundColor: `${primaryColor}1A`, // 10% opacity
    borderColor: `${primaryColor}33`, // 20% opacity
    color: primaryColor,
  };

  const createAccountCallback = useCallback(
    (accountAddress: string) => {
      router.replace(`/${accountAddress}`);
    },
    [router],
  );

  const handleLocal = useCallback(() => {
    startLoading(async () => {
      actions.openAccount(hash, createAccountCallback);
    });
  }, [hash, actions, startLoading, createAccountCallback]);

  useEffect(() => {
    console.log("hash", hash);
    if (hash) {
      handleLocal();
    }
  }, [handleLocal, hash]);

  return (
    <Button
      onClick={handleLocal}
      variant="outline"
      style={style}
      disabled={isLoading}
      className={cn(
        "inline-flex w-full items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "border",
        "h-11 px-4 py-2",
        "gap-2.5",
        "hover:bg-opacity-20",
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <IncognitoIcon className="h-4 w-4" />
      )}
      <span>Sign in with Local Account </span>
    </Button>
  );
}
