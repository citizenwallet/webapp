import { ApiService } from "../api";
import { ConfigType } from "@/types/config";

export class ConfigService {
  constructor(api: ApiService) {
    this.api = api;
  }

  api: ApiService;

  config?: ConfigType[];

  cacheBuster() {
    return Math.floor(new Date().getTime() / 1000);
  }

  async setConfig() {
    this.config = await this.api.get(
      "communities.json?cacheBuster=" + this.cacheBuster()
    );
  }

  async get(): Promise<ConfigType[]> {
    if (!this.config) {
      this.config = await this.api.get(
        "communities.json?cacheBuster=" + this.cacheBuster()
      );

      return this.config!;
    }

    this.setConfig();

    return this.config!;
  }

  async getCommunity(alias: string): Promise<ConfigType> {
    const config = await this.get();

    return config.find((c) => c.community.alias === alias)!;
  }
}
