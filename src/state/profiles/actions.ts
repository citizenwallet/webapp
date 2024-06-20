import { useMemo } from "react";
import { ProfilesState, useProfilesStore } from "./state";
import { StoreApi, UseBoundStore } from "zustand";
import { Config, ProfileService } from "@citizenwallet/sdk";

const RELOAD_INTERVAL = 30000;

export class ProfilesActions {
  state: ProfilesState;
  config: Config;

  profiles: ProfileService;
  constructor(state: ProfilesState, config: Config) {
    this.state = state;
    this.config = config;

    this.profiles = new ProfileService(config);
  }

  private lastLoadedProfile: { [key: string]: number } = {};
  async loadProfile(account: string) {
    try {
      if (this.lastLoadedProfile[account]) {
        const now = new Date().getTime();
        if (now - this.lastLoadedProfile[account] < RELOAD_INTERVAL) {
          return;
        }
      }
      this.lastLoadedProfile[account] = new Date().getTime();

      const profile = await this.profiles.getProfile(account);
      if (!profile) {
        throw new Error("Profile not found");
      }

      this.state.putProfile(profile);
    } catch (e) {
      console.error(e);
    }
  }

  async loadProfileFromUsername(username: string) {
    try {
      const profile = await this.profiles.getProfileFromUsername(
        username.replace("@", "")
      );
      if (!profile) {
        throw new Error("Profile not found");
      }

      this.state.putProfile(profile);
    } catch (e) {
      console.error(e);
    }
  }

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
