import { formatAddress } from "@/utils/formatting";
import { Profile } from "@citizenwallet/sdk";
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
    image: "/anonymous-user.svg",
    image_medium: "/anonymous-user.svg",
    image_small: "/anonymous-user.svg",
    name: "Anonymous",
    username: formatAddress(account),
  };
};

export const getMinterProfile = (account: string): Profile => {
  return {
    account,
    description: "",
    image: "/mint.svg",
    image_medium: "/mint.svg",
    image_small: "/mint.svg",
    name: "Mint",
    username: "@mint",
  };
};

export const getBurnerProfile = (account: string): Profile => {
  return {
    account,
    description: "",
    image: "/burn.svg",
    image_medium: "/burn.svg",
    image_small: "/burn.svg",
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
