import {
  Config as cwConfig,
  CommunityConfig as cwCommunityConfig,
  getTwoFAAddress as cwGetTwoFAAddress,
  isSessionExpired as cwIsSessionExpired,
  generateConnectionMessage as cwGenerateConnectionMessage,
  verifyConnectedUrl as cwVerifyConnectedUrl,
} from "@citizenwallet/sdk";
import { AuthMethod, SessionState, useSessionStore } from "./state";
import { StorageKeys, StorageService } from "@/services/storage";
import { Wallet } from "ethers";
import { WebAuthnCredential } from "@simplewebauthn/server";
import { StoreApi, UseBoundStore } from "zustand";
import { useMemo } from "react";
import { CWAccount } from "@/services/account";
import { getBytes } from "ethers";

export interface AuthSession {
  method: AuthMethod | null;
  accountAddress: string | null;
  isReadOnly: boolean;
  isSessionExpired: boolean;
}

export class SessionLogic {
  baseUrl: string;
  state: SessionState;
  communityConfig: cwCommunityConfig;
  storage: StorageService;
  cwAccount?: CWAccount;

  constructor(baseUrl: string, state: SessionState, config: cwConfig) {
    this.baseUrl = baseUrl;
    this.state = state;
    this.communityConfig = new cwCommunityConfig(config);
    this.storage = new StorageService(this.communityConfig.community.alias);
  }

  storePrivateKey(privateKey: string) {
    this.storage.setKey("session_private_key", privateKey);
    this.state.setPrivateKey(privateKey);
  }

  storeSessionHash(hash: string) {
    this.storage.setKey("session_hash", hash);
    this.state.setHash(hash);
  }

  storeSourceValue(sourceValue: string) {
    this.storage.setKey("session_source_value", sourceValue);
    this.state.setSourceValue(sourceValue);
  }

  storeSourceType(sourceType: string) {
    this.storage.setKey("session_source_type", sourceType);
    this.state.setSourceType(sourceType);
  }

  storePasskey(passkey: WebAuthnCredential) {
    this.storage.savePasskey(passkey);
    this.state.appendPasskey(passkey);
  }

  storePasskeyChallenge(challengeHash: string, challengeExpiry: number) {
    this.storage.setKey("session_challenge_hash", challengeHash);
    this.storage.setKey("session_challenge_expiry", challengeExpiry.toString());
  }

  getPasskeys(): WebAuthnCredential[] {
    const passkeys = this.storage.getAllPasskeys();

    return passkeys;
  }

  async getAccountAddress() {
    const sourceValue =
      this.state.sourceValue || this.storage.getKey("session_source_value");

    if (!sourceValue) {
      throw new Error("Source value not found");
    }

    const sourceType =
      this.state.sourceType || this.storage.getKey("session_source_type");

    if (!sourceType) {
      throw new Error("Source type not found");
    }

    const accountAddress = await cwGetTwoFAAddress({
      community: this.communityConfig,
      source: sourceValue,
      type: sourceType,
    });

    return accountAddress;
  }

  async isSessionExpired() {
    const accountAddress = await this.getAccountAddress();

    if (!accountAddress) {
      throw new Error("Account address not found");
    }

    const privateKey =
      this.state.privateKey || this.storage.getKey("session_private_key");

    if (!privateKey) {
      throw new Error("Private key not found");
    }

    const signer = new Wallet(privateKey);

    const isExpired = await cwIsSessionExpired({
      community: this.communityConfig,
      account: accountAddress,
      owner: signer.address,
    });

    return isExpired;
  }

  async getAuthSession(): Promise<AuthSession> {
    const walletHash = this.storage.getKey(StorageKeys.hash);
    const sourceType = this.storage.getKey(StorageKeys.session_source_type);
    const sourceValue = this.storage.getKey(StorageKeys.session_source_value);

    try {
      this.state.isLoading = true;

      if (walletHash) {
        const walletPassword = process.env.NEXT_PUBLIC_WEB_BURNER_PASSWORD;
        if (!walletPassword) {
          throw new Error("Wallet password not set");
        }
        const account = await CWAccount.fromHash(
          this.baseUrl,
          walletHash,
          walletPassword,
          this.communityConfig.config
        );
        const expiryTime = Date.now() + 1000 * 60 * 5; // 5 mins
        const signer = account.signer;
        let verifyConnectionResult = null;

        if (signer) {
          // verify account ownership
          const connectionHash = cwGenerateConnectionMessage(
            signer.address,
            expiryTime.toString()
          );
          const connectionHashInBytes = getBytes(connectionHash);
          const signedConnectionHash = await signer.signMessage(
            connectionHashInBytes
          );

          const params = new URLSearchParams();
          params.set("sigAuthAccount", signer.address);
          params.set("sigAuthExpiry", expiryTime.toString());
          params.set("sigAuthSignature", signedConnectionHash);

          verifyConnectionResult = await cwVerifyConnectedUrl(
            this.communityConfig,
            {
              params,
            }
          );
        }

        this.state.isLoading = false;
        return {
          method: "local",
          accountAddress: account.account,
          isReadOnly: !signer || !verifyConnectionResult,
          isSessionExpired: false,
        };
      }

      if (sourceValue && sourceType === "email") {
        const accountAddress = await this.getAccountAddress();
        const isSessionExpired = await this.isSessionExpired();

        this.state.isLoading = false;
        return {
          method: "email",
          accountAddress: accountAddress,
          isReadOnly: false,
          isSessionExpired: isSessionExpired,
        };
      }

      if (sourceValue && sourceType === "passkey") {
        const accountAddress = await this.getAccountAddress();
        const isSessionExpired = await this.isSessionExpired();

        this.state.isLoading = false;
        return {
          method: "passkey",
          accountAddress: accountAddress,
          isReadOnly: false,
          isSessionExpired: isSessionExpired,
        };
      }

      this.state.isLoading = false;
      return {
        method: null,
        accountAddress: null,
        isReadOnly: true,
        isSessionExpired: false,
      };
    } catch (error) {
      console.error("Error checking auth method:", error);
      this.state.isLoading = false;

      return {
        method: null,
        accountAddress: null,
        isReadOnly: true,
        isSessionExpired: false,
      };
    }
  }

  clear() {
    this.state.clear();
  }
}

export const useSession = (
  baseUrl: string,
  config: cwConfig
): [UseBoundStore<StoreApi<SessionState>>, SessionLogic] => {
  const sessionStore = useSessionStore;

  const actions = useMemo(
    () => new SessionLogic(baseUrl, sessionStore.getState(), config),
    [baseUrl, sessionStore, config]
  );

  return [sessionStore, actions];
};
