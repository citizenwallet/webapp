import { create } from "zustand";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { devtools } from "zustand/middleware";
import { Config } from "@/services/config";

export type CommunitiesStore = {
  community?: Config;
  loading: boolean;
  error: boolean;
  fetchCommunityRequest: () => void;
  fetchCommunitySuccess: (community: Config) => void;
  fetchCommunityFailure: () => void;
};

export const useCommunitiesStore = create<CommunitiesStore>()(
  devtools((set) => ({
    transactions: [],
    loading: false,
    error: false,
    fetchCommunityRequest: () => set({ loading: true, error: false }),
    fetchCommunitySuccess: (community: Config) =>
      set({ community, loading: false, error: false }),
    fetchCommunityFailure: () => set({ loading: false, error: true }),
  }))
);
