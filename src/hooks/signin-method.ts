import { useState, useEffect, useCallback } from "react";
import { StorageService, StorageKeys } from "@/services/storage";
import { CWAccount } from "@/services/account";
import { getBaseUrl } from "@/utils/deeplink";
import * as cwSDK from "@citizenwallet/sdk";
import { generateSessionSalt } from "@/services/session";

export type AuthMethod = "passkey" | "local" | "email" | "none";

export function useSigninMethod(config: cwSDK.Config) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("none");
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);

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
        config
      );

      return account;
    },
    [baseUrl, config]
  );

  const handleSetters = useCallback(
    ({
      method,
      accountAddress,
      isReadOnly,
    }: {
      method: AuthMethod;
      accountAddress: string | null;
      isReadOnly: boolean;
    }) => {
      setAuthMethod(method);
      setAccountAddress(accountAddress);
      setIsLoading(false);
      setIsReadOnly(isReadOnly);
    },
    []
  );

  useEffect(() => {
    (async () => {
      try {
        const storageService = new StorageService(config.community.alias);

        const communityConfig = new cwSDK.CommunityConfig(config);

        const providerAddress =
          communityConfig.primarySessionConfig.provider_address;

        const walletHash = storageService.getKey(StorageKeys.hash);

        const sourceType = storageService.getKey(
          StorageKeys.session_source_type
        );
        const sourceValue = storageService.getKey(
          StorageKeys.session_source_value
        );

        // local sign in
        if (walletHash) {
          const account = await accountOfLocalSignIn(walletHash);
          const expiryTime = Date.now() + 1000 * 60 * 5; // 5 mins
          const signer = account.signer;

          let verifyConnectionResult = null;
          if (signer) {
            // verify account ownership
            const connectionHash = cwSDK.generateConnectionMessage(
              signer.address,
              expiryTime.toString()
            );
              
            const signedConnectionHash =
              await signer.signMessage(connectionHash);

            const params = new URLSearchParams();
            params.set("sigAuthAccount", signer.address);
            params.set("sigAuthExpiry", expiryTime.toString());
            params.set("sigAuthSignature", signedConnectionHash);

            verifyConnectionResult = await cwSDK.verifyConnectedUrl(
              communityConfig,
              {
                params,
              }
            );
          }

          handleSetters({
            method: "local",
            accountAddress: account.account,
            isReadOnly: !signer || !verifyConnectionResult,
          });
          return;
        }

        // email sign in
        if (sourceValue && sourceType === "email") {
          const salt = generateSessionSalt(sourceValue, sourceType);

          const accountAddress = await cwSDK.getAccountAddress(
            communityConfig,
            providerAddress,
            BigInt(salt)
          );

          handleSetters({
            method: "email",
            accountAddress: accountAddress,
            isReadOnly: false, // FIXME: evaluate
          });

          return;
        }

        //   passkey sign in
        if (sourceValue && sourceType === "passkey") {
          const salt = generateSessionSalt(sourceValue, sourceType);

          const accountAddress = await cwSDK.getAccountAddress(
            communityConfig,
            providerAddress,
            BigInt(salt)
          );

          handleSetters({
            method: "passkey",
            accountAddress: accountAddress,
            isReadOnly: false, // FIXME: evaluate
          });
          return;
        }

        handleSetters({
          method: "none",
          accountAddress: null,
          isReadOnly: true,
        });
      } catch (error) {
        console.error("Error checking auth method:", error);
        handleSetters({
          method: "none",
          accountAddress: null,
          isReadOnly: true,
        });
      }
    })();
  }, [config, accountOfLocalSignIn, handleSetters]);

  return {
    authMethod,
    isLoading,
    accountAddress,
    isReadOnly,
  };
}
