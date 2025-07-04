import { formatAddress } from "@/utils/formatting";
import { ConfigCommunity, ConfigToken, Profile } from "@citizenwallet/sdk";
import { create } from "zustand";

export interface ProfilesState {
  loading: boolean;
  profiles: {
    [key: string]: Profile;
  };
  startLoading: () => void;
  stopLoading: () => void;
  putProfile: (profile: Profile) => void;
  clear: () => void;
}

export const getEmptyProfile = (account: string): Profile => {
  return {
    account,
    description: "",
    image: "",
    image_medium: "",
    image_small: "",
    name: "Anonymous",
    username: formatAddress(account),
  };
};

export const getMinterProfile = (
  account: string,
  community: ConfigCommunity,
  token?: ConfigToken
): Profile => {
  return {
    account,
    description: "",
    image: token?.logo ?? community.logo,
    image_medium: token?.logo ?? community.logo,
    image_small: token?.logo ?? community.logo,
    name: "Mint",
    username: "@mint",
  };
};

export const getBurnerProfile = (
  account: string,
  community: ConfigCommunity,
  token?: ConfigToken
): Profile => {
  return {
    account,
    description: "",
    image: token?.logo ?? community.logo,
    image_medium: token?.logo ?? community.logo,
    image_small: token?.logo ?? community.logo,
    name: "Burn",
    username: "@burn",
  };
};

const initialState = () => ({
  profiles: {},
  loading: false,
});

export const useProfilesStore = create<ProfilesState>((set) => ({
  ...initialState(),
  startLoading: () => set({ loading: true }),
  stopLoading: () => set({ loading: false }),
  putProfile: (profile) =>
    set((state) => ({
      profiles: {
        ...state.profiles,
        [profile.account]: { ...profile, username: `@${profile.username}` },
      },
    })),
  clear: () => set(initialState()),
}));
