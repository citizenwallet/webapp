import { formatAddress } from "@/utils/formatting";
import { ConfigCommunity, Profile } from "@citizenwallet/sdk";
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
  community: ConfigCommunity
): Profile => {
  return {
    account,
    description: "",
    image: community.logo,
    image_medium: community.logo,
    image_small: community.logo,
    name: "Mint",
    username: "@mint",
  };
};

export const getBurnerProfile = (
  account: string,
  community: ConfigCommunity
): Profile => {
  return {
    account,
    description: "",
    image: community.logo,
    image_medium: community.logo,
    image_small: community.logo,
    name: "Burn",
    username: "@burn",
  };
};

const initialState = () => ({
  profiles: {
    "0x1234567890123456789012345678901234567890": {
      account: "0x1234567890123456789012345678901234567890",
      description: "Blockchain enthusiast and developer",
      image: "https://example.com/avatar1.jpg",
      image_medium: "https://example.com/avatar1_medium.jpg",
      image_small: "https://example.com/avatar1_small.jpg",
      name: "Alice Nakamoto",
      username: "@alice_blockchain",
    },
    "0x2345678901234567890123456789012345678901": {
      account: "0x2345678901234567890123456789012345678901",
      description: "Crypto trader and analyst",
      image: "https://example.com/avatar2.jpg",
      image_medium: "https://example.com/avatar2_medium.jpg",
      image_small: "https://example.com/avatar2_small.jpg",
      name: "Bob Buterin",
      username: "@bob_crypto",
    },
    "0x3456789012345678901234567890123456789012": {
      account: "0x3456789012345678901234567890123456789012",
      description: "DeFi protocol researcher",
      image: "https://example.com/avatar3.jpg",
      image_medium: "https://example.com/avatar3_medium.jpg",
      image_small: "https://example.com/avatar3_small.jpg",
      name: "Carol Chain",
      username: "@carol_defi",
    },
    "0x4567890123456789012345678901234567890123": {
      account: "0x4567890123456789012345678901234567890123",
      description: "NFT artist and collector",
      image: "https://example.com/avatar4.jpg",
      image_medium: "https://example.com/avatar4_medium.jpg",
      image_small: "https://example.com/avatar4_small.jpg",
      name: "David Digital",
      username: "@david_nft",
    },
    "0x5678901234567890123456789012345678901234": {
      account: "0x5678901234567890123456789012345678901234",
      description: "Smart contract auditor",
      image: "https://example.com/avatar5.jpg",
      image_medium: "https://example.com/avatar5_medium.jpg",
      image_small: "https://example.com/avatar5_small.jpg",
      name: "Eve Ethereum",
      username: "@eve_audit",
    },
    "0x6789012345678901234567890123456789012345": {
      account: "0x6789012345678901234567890123456789012345",
      description: "Blockchain governance expert",
      image: "https://example.com/avatar6.jpg",
      image_medium: "https://example.com/avatar6_medium.jpg",
      image_small: "https://example.com/avatar6_small.jpg",
      name: "Frank Finney",
      username: "@frank_governance",
    },
    "0x7890123456789012345678901234567890123456": {
      account: "0x7890123456789012345678901234567890123456",
      description: "Crypto educator and influencer",
      image: "https://example.com/avatar7.jpg",
      image_medium: "https://example.com/avatar7_medium.jpg",
      image_small: "https://example.com/avatar7_small.jpg",
      name: "Grace Gavin",
      username: "@grace_crypto",
    },
    "0x8901234567890123456789012345678901234567": {
      account: "0x8901234567890123456789012345678901234567",
      description: "Decentralized storage researcher",
      image: "https://example.com/avatar8.jpg",
      image_medium: "https://example.com/avatar8_medium.jpg",
      image_small: "https://example.com/avatar8_small.jpg",
      name: "Henry Hash",
      username: "@henry_storage",
    },
    "0x9012345678901234567890123456789012345678": {
      account: "0x9012345678901234567890123456789012345678",
      description: "Zero-knowledge proof developer",
      image: "https://example.com/avatar9.jpg",
      image_medium: "https://example.com/avatar9_medium.jpg",
      image_small: "https://example.com/avatar9_small.jpg",
      name: "Ivy Incognito",
      username: "@ivy_zkp",
    },
    "0x0123456789012345678901234567890123456789": {
      account: "0x0123456789012345678901234567890123456789",
      description: "Cross-chain interoperability researcher",
      image: "https://example.com/avatar10.jpg",
      image_medium: "https://example.com/avatar10_medium.jpg",
      image_small: "https://example.com/avatar10_small.jpg",
      name: "Jack Bridge",
      username: "@jack_interop",
    },
  },
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
