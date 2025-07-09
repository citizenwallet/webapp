import { Config, parseAliasFromDomain } from "@citizenwallet/sdk";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { getServiceRoleClient } from "../top-db";
import { getCommunityByAlias } from "../top-db/community";
import ManualMappingJson from "./manualMapping.json";

// Define type for manual mapping to allow string indexing
type ManualMapping = { [key: string]: string };
const typedManualMapping = ManualMappingJson as ManualMapping;

export const readCommunityFile = async (
  _alias = process.env.FALLBACK_COMMUNITY_ALIAS ?? ""
): Promise<Config | undefined> => {
  let alias = _alias;

  if (process.env.NODE_ENV === "development") {
    alias = process.env.FALLBACK_COMMUNITY_ALIAS ?? "";
  }

  const client = getServiceRoleClient();

  try {
    const community = await getCommunityByAlias(client, alias);

    if (community.data) {
      return community.data.json;
    }

    return undefined;
  } catch (error) {
    console.error("Error fetching community by alias:", error);
    return undefined;
  }
};

export const getCommunityFromHeaders = async (
  headersList: ReadonlyHeaders
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
