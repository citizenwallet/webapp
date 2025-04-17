import * as cwSKD from "@citizenwallet/sdk";
import { SessionState } from "./state";
import { StorageService } from "@/services/storage";
import { generateSessionSalt } from "@/services/session";

export class SessionLogic {
  getState: () => SessionState;
  communityConfig: cwSKD.CommunityConfig;
  storage: StorageService;

  constructor(getState: () => SessionState, config: cwSKD.Config) {
  
    this.getState = getState;
    this.communityConfig = new cwSKD.CommunityConfig(config);
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
    const sourceValue = this.getState().sourceValue;

    if (!sourceValue) {
      throw new Error("Source value not found");
    }

    const sourceType = this.getState().sourceType;

    if (!sourceType) {
      throw new Error("Source type not found");
    }

    const provider = this.communityConfig.primarySessionConfig.provider_address;

    const salt = generateSessionSalt(sourceValue, sourceType);

    const accountAddress = await cwSKD.getAccountAddress(
      this.communityConfig,
      provider,
      BigInt(salt)
    );

    return accountAddress;
  }

  clear() {
    this.getState().clear();
  }
}
