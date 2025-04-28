import * as cwSDK from "@citizenwallet/sdk";
import { SessionState, useSessionStore } from "./state";
import { StorageService } from "@/services/storage";
import { Wallet } from "ethers";
import { WebAuthnCredential } from "@simplewebauthn/server";
import { StoreApi, UseBoundStore } from "zustand";
import { useMemo } from "react";

export class SessionLogic {
  state: SessionState;
  communityConfig: cwSDK.CommunityConfig;
  storage: StorageService;

  constructor(state: SessionState, config: cwSDK.Config) {
    this.state = state;
    this.communityConfig = new cwSDK.CommunityConfig(config);
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
    // this.getState().setChallengeHash(challengeHash);
    // this.getState().setChallengeExpiry(challengeExpiry);
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

    const accountAddress = await cwSDK.getTwoFAAddress({
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

    const isExpired = await cwSDK.isSessionExpired({
      community: this.communityConfig,
      account: accountAddress,
      owner: signer.address,
    });

    return false;
  }

  clear() {
    this.state.clear();
  }
}

export const useSession = (
  config: cwSDK.Config,
): [UseBoundStore<StoreApi<SessionState>>, SessionLogic] => {
  const sessionStore = useSessionStore;

  const actions = useMemo(
    () => new SessionLogic(sessionStore.getState(), config),
    [sessionStore, config],
  );

  return [sessionStore, actions];
};
