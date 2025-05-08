import { Config, parseAliasFromDomain } from "@citizenwallet/sdk";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

import CommunitiesJson from "./communities.json";
import LocalCommunitiesJson from "./communities.local.json";
import ManualMappingJson from "./manualMapping.json";

// Define type for manual mapping to allow string indexing
type ManualMapping = { [key: string]: string };
const typedManualMapping = ManualMappingJson as ManualMapping;

const getCommunityFile = async (): Promise<Config[]> => {
  if (process.env.NODE_ENV === "production") {
    return CommunitiesJson as unknown as Config[];
  }

  return LocalCommunitiesJson as unknown as Config[];
};

export const readCommunityFile = async (
  _alias = process.env.FALLBACK_COMMUNITY_ALIAS ?? "",
): Promise<Config | undefined> => {
  let alias = _alias;
  if (process.env.NODE_ENV === "development") {
    alias = process.env.FALLBACK_COMMUNITY_ALIAS ?? "";
  }

  const configs = await getCommunityFile();
  if (!configs) {
    return undefined;
  }

  if (configs.length === 0) {
    return undefined;
  }

  return configs.find((c) => c.community.alias === alias);
};

export const getCommunityFromHeaders = async (
  headersList: ReadonlyHeaders,
): Promise<Config | undefined> => {
  const domain = headersList.get("host") || "";

  let alias = domain;
  if (typedManualMapping[domain]) {
    alias = typedManualMapping[domain];
  } else {
    alias = parseAliasFromDomain(domain, process.env.DOMAIN_BASE_PATH || "");
  }

  return readCommunityFile(alias);
};
