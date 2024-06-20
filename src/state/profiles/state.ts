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
    image: `https://api.multiavatar.com/${account}.png`,
    image_medium: `https://api.multiavatar.com/${account}.png`,
    image_small: `https://api.multiavatar.com/${account}.png`,
    name: "Anonymous",
    username: formatAddress(account),
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
        [profile.account]: profile,
      },
    })),
  clear: () => set(initialState()),
}));
