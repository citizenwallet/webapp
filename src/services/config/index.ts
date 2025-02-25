import { Config } from "@citizenwallet/sdk";
import { existsSync, readFileSync } from "fs";
import path from "path";

const getCommunityPath = () =>
  process.env.COMMUNITIES_JSON_PATH || "communities.json";

export const readCommunityFile = (
  _alias = process.env.FALLBACK_COMMUNITY_ALIAS ?? ""
): Config | undefined => {
  let alias = _alias;
  if (process.env.NODE_ENV === "development") {
    // when developing locally, we use the fallback alias since localhost won't resolve to a community
    alias = process.env.FALLBACK_COMMUNITY_ALIAS ?? "";
  }

  if (!communityFileExists()) {
    return undefined;
  }

  // read community.json file
  const filePath = path.join(process.cwd(), getCommunityPath());
  const fileContents = readFileSync(filePath, "utf8");
  const configs = JSON.parse(fileContents) as Config[];
  if (configs.length === 0) {
    return undefined;
  }

  return configs.find((c) => c.community.alias === alias);
};

export const communityFileExists = (): boolean => {
  const filePath = path.join(process.cwd(), getCommunityPath());
  return existsSync(filePath);
};
