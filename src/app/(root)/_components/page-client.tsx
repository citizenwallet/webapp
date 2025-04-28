"use client";

import { Config } from "@citizenwallet/sdk";
import { useSigninMethod } from "@/hooks/signin-method";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PageClientProps {
  config: Config;
}

export default function PageClient({ config }: PageClientProps) {
  const router = useRouter();
  const { isSessionExpired, accountAddress } = useSigninMethod(config);

  useEffect(() => {
    if (accountAddress && !isSessionExpired) {
      // Redirect to account page when we have an address
      router.replace(`/${accountAddress}`);
      return;
    }
  }, [accountAddress, isSessionExpired, router]);

  return <></>;
}
