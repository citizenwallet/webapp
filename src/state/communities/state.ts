import { create } from "zustand";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { devtools } from "zustand/middleware";
import { ConfigType } from "@/types/config";

export type CommunitiesStore = {
  community?: ConfigType;
  loading: boolean;
  error: boolean;
  fetchCommunityRequest: () => void;
  fetchCommunitySuccess: (community: ConfigType) => void;
  fetchCommunityFailure: () => void;
};

export const useCommunitiesStore = create<CommunitiesStore>()(
  devtools((set) => ({
    transactions: [],
    loading: false,
    error: false,
    fetchCommunityRequest: () => set({ loading: true, error: false }),
    fetchCommunitySuccess: (community: ConfigType) =>
      set({ community, loading: false, error: false }),
    fetchCommunityFailure: () => set({ loading: false, error: true }),
  }))
);
