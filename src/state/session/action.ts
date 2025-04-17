import * as cwSKD from "@citizenwallet/sdk";
import { SessionState } from "./state";
import { StorageService } from "@/services/storage";
import { generateSessionSalt } from "@/services/session";

export class SessionLogic {
  state: SessionState;
  communityConfig: cwSKD.CommunityConfig;
  storage: StorageService;

  constructor(state: SessionState, config: cwSKD.Config) {
    this.state = state;
    this.communityConfig = new cwSKD.CommunityConfig(config);
    this.storage = new StorageService(this.communityConfig.community.alias);
  }

  storePrivateKey(privateKey: string) {
    this.storage.setKey("SESSION_PRIVATE_KEY", privateKey);
    this.state.setPrivateKey(privateKey);
  }

  storeSessionHash(hash: string) {
    this.storage.setKey("SESSION_HASH", hash);
    this.state.setHash(hash);
  }

  storeSourceValue(sourceValue: string) {
    this.storage.setKey("SESSION_SOURCE_VALUE", sourceValue);
    this.state.setSourceValue(sourceValue);
  }

  storeSourceType(sourceType: string) {
    this.storage.setKey("SESSION_SOURCE_TYPE", sourceType);
    this.state.setSourceType(sourceType);
  }

  async getAccountAddress() {
    const sourceValue =
      this.state.sourceValue || this.storage.getKey("SESSION_SOURCE_VALUE");

    if (!sourceValue) {
      throw new Error("Source value not found");
    }

    const sourceType =
      this.state.sourceType || this.storage.getKey("SESSION_SOURCE_TYPE");

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
    this.state.clear();
  }
}
