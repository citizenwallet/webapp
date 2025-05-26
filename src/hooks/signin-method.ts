import { useState, useEffect, useCallback } from "react";
import { StorageService, StorageKeys } from "@/services/storage";
import { CWAccount } from "@/services/account";
import { getBaseUrl } from "@/utils/deeplink";
import {Config as cwConfig, CommunityConfig as cwCommunityConfig, generateConnectionMessage as cwGenerateConnectionMessage, verifyConnectedUrl as cwVerifyConnectedUrl} from "@citizenwallet/sdk";
import { useSession } from "@/state/session/action";
import { getBytes } from "ethers";

export type AuthMethod = "passkey" | "local" | "email" | "none";

export function useSigninMethod(config: cwConfig) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("none");
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [sessionState, sessionActions] = useSession(config);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const baseUrl = getBaseUrl();

  const accountOfLocalSignIn = useCallback(
    async (walletHash: string) => {
      const walletPassword = process.env.NEXT_PUBLIC_WEB_BURNER_PASSWORD;
      if (!walletPassword) {
        throw new Error("Wallet password not set");
      }

      const account = await CWAccount.fromHash(
        baseUrl,
        walletHash,
        walletPassword,
        config,
      );

      return account;
    },
    [baseUrl, config],
  );

  const handleSetters = useCallback(
    ({
      method,
      accountAddress,
      isReadOnly,
      isSessionExpired,
    }: {
      method: AuthMethod;
      accountAddress: string | null;
      isReadOnly: boolean;
      isSessionExpired: boolean;
    }) => {
      setAuthMethod(method);
      setAccountAddress(accountAddress);
      setIsLoading(false);
      setIsReadOnly(isReadOnly);
      setIsSessionExpired(isSessionExpired);
    },
    [],
  );

  useEffect(() => {
    (async () => {
      try {
        const storageService = new StorageService(config.community.alias);
        const communityConfig = new cwCommunityConfig(config);
        const walletHash = storageService.getKey(StorageKeys.hash);

        const sourceType = storageService.getKey(
          StorageKeys.session_source_type,
        );
        const sourceValue = storageService.getKey(
          StorageKeys.session_source_value,
        );

        // local sign in
        if (walletHash) {
          const account = await accountOfLocalSignIn(walletHash);
          const expiryTime = Date.now() + 1000 * 60 * 5; // 5 mins
          const signer = account.signer;

          let verifyConnectionResult = null;
          if (signer) {
            // verify account ownership
            const connectionHash = cwGenerateConnectionMessage(
              signer.address,
              expiryTime.toString(),
            );
            const connectionHashInBytes = getBytes(connectionHash);
            const signedConnectionHash = await signer.signMessage(
              connectionHashInBytes,
            );

            const params = new URLSearchParams();
            params.set("sigAuthAccount", signer.address);
            params.set("sigAuthExpiry", expiryTime.toString());
            params.set("sigAuthSignature", signedConnectionHash);

            verifyConnectionResult = await cwVerifyConnectedUrl(
              communityConfig,
              {
                params,
              },
            );
          }

          handleSetters({
            method: "local",
            accountAddress: account.account,
            isReadOnly: !signer || !verifyConnectionResult,
            isSessionExpired: false,
          });
          return;
        }

        // email sign in
        if (sourceValue && sourceType === "email") {
          const accountAddress = await sessionActions.getAccountAddress();
          const isSessionExpired = await sessionActions.isSessionExpired();

          handleSetters({
            method: "email",
            accountAddress: accountAddress,
            isReadOnly: false,
            isSessionExpired: isSessionExpired,
          });

          return;
        }

        //   passkey sign in
        if (sourceValue && sourceType === "passkey") {
          const accountAddress = await sessionActions.getAccountAddress();
          const isSessionExpired = await sessionActions.isSessionExpired();

          handleSetters({
            method: "passkey",
            accountAddress: accountAddress,
            isReadOnly: false,
            isSessionExpired: isSessionExpired,
          });
          return;
        }

        handleSetters({
          method: "none",
          accountAddress: null,
          isReadOnly: true,
          isSessionExpired: false,
        });
      } catch (error) {
        console.error("Error checking auth method:", error);
        handleSetters({
          method: "none",
          accountAddress: null,
          isReadOnly: true,
          isSessionExpired: false,
        });
      }
    })();
  }, [config, accountOfLocalSignIn, handleSetters, sessionActions]);

  return {
    authMethod,
    isLoading,
    accountAddress,
    isReadOnly,
    isSessionExpired,
  };
}
