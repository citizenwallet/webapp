import * as cwSDK from "@citizenwallet/sdk";
import { SessionState } from "./state";
import { StorageService } from "@/services/storage";
import { generateSessionSalt } from "@/services/session";
import { Wallet } from "ethers";

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
    this.storage.setKey("SESSION_PRIVATE_KEY", privateKey);
    this.getState().setPrivateKey(privateKey);
  }

  storeSessionHash(hash: string) {
    this.storage.setKey("SESSION_HASH", hash);
    this.getState().setHash(hash);
  }

  storeSourceValue(sourceValue: string) {
    this.storage.setKey("SESSION_SOURCE_VALUE", sourceValue);
    this.getState().setSourceValue(sourceValue);
  }

  storeSourceType(sourceType: string) {
    this.storage.setKey("SESSION_SOURCE_TYPE", sourceType);
    this.getState().setSourceType(sourceType);
  }

  async getAccountAddress() {
    const sourceValue = this.getState().sourceValue || this.storage.getKey("SESSION_SOURCE_VALUE");

    if (!sourceValue) {
      throw new Error("Source value not found");
    }

    const sourceType = this.getState().sourceType || this.storage.getKey("SESSION_SOURCE_TYPE");

    if (!sourceType) {
      throw new Error("Source type not found");
    }

    const provider = this.communityConfig.primarySessionConfig.provider_address;

    const salt = generateSessionSalt(sourceValue, sourceType);

    const accountAddress = await cwSDK.getAccountAddress(
      this.communityConfig,
      provider,
      BigInt(salt)
    );

    return accountAddress;
  }

  async isSessionExpired() {
    const accountAddress = await this.getAccountAddress();

    if (!accountAddress) {
      throw new Error("Account address not found");
    }

    const privateKey = this.getState().privateKey || this.storage.getKey("SESSION_PRIVATE_KEY");

    if (!privateKey) {
      throw new Error("Private key not found");
    }

    const signer = new Wallet(privateKey);

    const isExpired = await cwSDK.isSessionExpired({
      community: this.communityConfig,
      account: accountAddress,
      owner: signer.address,
    });

    return isExpired;
  }

  clear() {
    this.getState().clear();
  }
}
