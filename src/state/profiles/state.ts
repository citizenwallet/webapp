import { formatAddress } from "@/utils/address";
import { Profile } from "@citizenwallet/sdk";
import { create } from "zustand";

interface ProfilesState {
  profiles: {
    [key: string]: Profile;
  };
  putProfile: (profile: Profile) => void;
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

const generateDummyProfiles = () => {
  const dummyProfiles: { [key: string]: Profile } = {};

  for (let i = 0; i < 10; i++) {
    const username = `user${i}`;
    dummyProfiles[username] = {
      account: `0x123123456456${i}`,
      description: `This is a description for ${username}`,
      image: `https://github.com/shadcn.png`,
      image_medium: `https://github.com/shadcn.png`,
      image_small: `https://github.com/shadcn.png`,
      name: `Name ${i}`,
      username: username,
    };
  }

  return dummyProfiles;
};

const initialState = () => ({
  profiles: generateDummyProfiles(),
});

export const useProfilesStore = create<ProfilesState>((set) => ({
  ...initialState(),
  putProfile: (profile) =>
    set((state) => ({
      profiles: {
        ...state.profiles,
        [profile.username]: profile,
      },
    })),
}));
