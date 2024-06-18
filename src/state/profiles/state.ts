import { formatAddress } from "@/utils/address";
import { Profile } from "@citizenwallet/sdk";
import { create } from "zustand";

export interface ProfilesState {
  profiles: {
    [key: string]: Profile;
  };
  putProfile: (profile: Profile) => void;
  clear: () => void;
}

export const getEmptyProfile = (account: string): Profile => {
  return {
    account,
    description: "",
    image: `https://api.multiavatar.com/${account}.png`,
    image_medium: `https://api.multiavatar.com/${account}.png`,
    image_small: `https://api.multiavatar.com/${account}.png`,
    name: "Anonymous",
    username: formatAddress(account),
  };
};

const initialState = () => ({
  profiles: {},
});

export const useProfilesStore = create<ProfilesState>((set) => ({
  ...initialState(),
  putProfile: (profile) =>
    set((state) => ({
      profiles: {
        ...state.profiles,
        [profile.account]: profile,
      },
    })),
  clear: () => set(initialState()),
}));
