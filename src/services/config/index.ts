import { Config } from "@citizenwallet/sdk";
import { existsSync, readFileSync } from "fs";
import path from "path";

const communityPath =
  process.env.NEXT_PUBLIC_COMMUNITY_JSON_PATH || "community.json";

export const readCommunityFile = (): Config | undefined => {
  if (!communityFileExists()) {
    return undefined;
  }

  // read community.json file
  const filePath = path.join(process.cwd(), communityPath);
  const fileContents = readFileSync(filePath, "utf8");
  const config = JSON.parse(fileContents) as Config;
  return config;
};

export const communityFileExists = (): boolean => {
  const filePath = path.join(process.cwd(), communityPath);
  return existsSync(filePath);
};
