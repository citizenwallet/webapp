import * as cwSDK from "@citizenwallet/sdk";
import { SessionState } from "./state";
import { StorageService } from "@/services/storage";
import { generateSessionSalt } from "@/services/session";
import { Wallet } from "ethers";
import { WebAuthnCredential } from "@simplewebauthn/server";

export class SessionLogic {
  getState: () => SessionState;
  communityConfig: cwSDK.CommunityConfig;
  storage: StorageService;

  constructor(getState: () => SessionState, config: cwSDK.Config) {
    this.getState = getState;
    this.communityConfig = new cwSDK.CommunityConfig(config);
    this.storage = new StorageService(this.communityConfig.community.alias);
  }

  storePrivateKey(privateKey: string) {
    this.storage.setKey("session_private_key", privateKey);
    this.getState().setPrivateKey(privateKey);
  }

  storeSessionHash(hash: string) {
    this.storage.setKey("session_hash", hash);
    this.getState().setHash(hash);
  }

  storeSourceValue(sourceValue: string) {
    this.storage.setKey("session_source_value", sourceValue);
    this.getState().setSourceValue(sourceValue);
  }

  storeSourceType(sourceType: string) {
    this.storage.setKey("session_source_type", sourceType);
    this.getState().setSourceType(sourceType);
  }

  storePasskey(passkey: WebAuthnCredential) {
    this.storage.savePasskey(passkey);
    this.getState().appendPasskey(passkey);
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
      this.getState().sourceValue ||
      this.storage.getKey("session_source_value");

    if (!sourceValue) {
      throw new Error("Source value not found");
    }

    const sourceType =
      this.getState().sourceType || this.storage.getKey("session_source_type");

    if (!sourceType) {
      throw new Error("Source type not found");
    }

    const provider = this.communityConfig.primarySessionConfig.provider_address;

    const salt = generateSessionSalt(sourceValue, sourceType);

    const accountAddress = await cwSDK.getAccountAddress(
      this.communityConfig,
      provider,
      BigInt(salt),
    );

    return accountAddress;
  }

  async isSessionExpired() {
    const accountAddress = await this.getAccountAddress();

    if (!accountAddress) {
      throw new Error("Account address not found");
    }

    const privateKey =
      this.getState().privateKey || this.storage.getKey("session_private_key");

    if (!privateKey) {
      throw new Error("Private key not found");
    }

    const signer = new Wallet(privateKey);

    // TODO: temp comment
    // const isExpired = await cwSDK.isSessionExpired({
    //   community: this.communityConfig,
    //   account: accountAddress,
    //   owner: signer.address,
    // });

    return false;
  }

  clear() {
    this.getState().clear();
  }
}
