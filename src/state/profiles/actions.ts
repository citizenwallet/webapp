import { useMemo } from "react";
import debounce from "debounce";
import { ProfilesState, useProfilesStore } from "./state";
import { StoreApi, UseBoundStore } from "zustand";
import { Config, CommunityConfig, getProfileFromAddress, getProfileFromUsername } from "@citizenwallet/sdk";

const RELOAD_INTERVAL = 30000;

export class ProfilesActions {
  state: ProfilesState;
  config: Config;
  communityConfig: CommunityConfig;

  constructor(state: ProfilesState, config: Config) {
    this.state = state;
    this.config = config;
    this.communityConfig = new CommunityConfig(config);
  }

  private lastLoadedProfile: { [key: string]: number } = {};
  async loadProfile(account: string) {
    try {
      this.state.startLoading();

      if (this.lastLoadedProfile[account]) {
        const now = new Date().getTime();
        if (now - this.lastLoadedProfile[account] < RELOAD_INTERVAL) {
          return;
        }
      }
      this.lastLoadedProfile[account] = new Date().getTime();

      const profile = await getProfileFromAddress(
        this.communityConfig.ipfs.url,
        this.communityConfig,
        account
      );

      if (!profile) {
        throw new Error("Profile not found");
      }

      this.state.putProfile(profile);
    } catch (e) {
      console.error(e);
    }

    this.state.stopLoading();
  }

  async loadProfileFromUsername(username: string) {
    try {
      this.state.startLoading();

      const profile = await getProfileFromUsername(
        this.communityConfig.ipfs.url,
        this.communityConfig,
        username
      );

      if (!profile) {
        throw new Error("Profile not found");
      }

      this.state.putProfile(profile);
    } catch (e) {
      console.error(e);
    }

    this.state.stopLoading();
  }

  debouncedLoadProfileFromUsername = debounce(
    this.loadProfileFromUsername,
    500
  );

  clear() {
    this.state.clear();
  }
}

export const useProfiles = (
  config: Config
): [UseBoundStore<StoreApi<ProfilesState>>, ProfilesActions] => {
  const profilesStore = useProfilesStore;

  const actions = useMemo(
    () => new ProfilesActions(profilesStore.getState(), config),
    [profilesStore, config]
  );

  return [profilesStore, actions];
};
