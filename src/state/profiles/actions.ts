import { useMemo } from "react";
import { ProfilesState, useProfilesStore } from "./state";
import { StoreApi, UseBoundStore } from "zustand";
import {
  Config,
  ProfileContractService,
  ProfileService,
} from "@citizenwallet/sdk";
import { CWAccount } from "@/services/account";
import { JsonRpcProvider } from "ethers";

class ProfilesLogic {
  state: ProfilesState;
  config: Config;

  profiles: ProfileService;
  constructor(state: ProfilesState, config: Config) {
    this.state = state;
    this.config = config;

    this.profiles = new ProfileService(config);
  }

  async loadProfile(account: string) {
    try {
      const profile = await this.profiles.getProfile(account);
      if (!profile) {
        throw new Error("Profile not found");
      }

      this.state.putProfile(profile);
    } catch (_) {}
  }

  clear() {
    this.state.clear();
  }
}

export const useProfiles = (
  config: Config
): [UseBoundStore<StoreApi<ProfilesState>>, ProfilesLogic] => {
  const profilesStore = useProfilesStore;

  const actions = useMemo(
    () => new ProfilesLogic(profilesStore.getState(), config),
    [profilesStore, config]
  );

  return [profilesStore, actions];
};
