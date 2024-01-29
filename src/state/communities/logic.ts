import { CommunitiesStore } from "./state";
import { useRef } from "react";
import { Config, ConfigService } from "@/services/config";
import { ApiService } from "@/services/api";

class CommunitiesLogic {
  configService: ConfigService;

  constructor(private store: CommunitiesStore, private alias: string) {
    this.store = store;

    const api = new ApiService(process.env.NEXT_PUBLIC_COMMUNITY_CONFIG_URL!);
    this.configService = new ConfigService(api);
  }

  fetchCommunity = async () => {
    try {
      this.store.fetchCommunityRequest();

      const community: Config = await this.configService.getCommunity(
        this.alias
      );

      this.store.fetchCommunitySuccess(community);
    } catch (error) {
      console.log(error);

      this.store.fetchCommunityFailure();
    }
  };
}

export const useCommunitiesLogic = (store: CommunitiesStore, alias: string) => {
  const logicRef = useRef(new CommunitiesLogic(store, alias));

  return logicRef.current;
};
