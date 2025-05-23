"use server";

import { isAddress } from "ethers";
import {
  Config,
  getENSAddress,
  CommunityConfig,
  getProfileFromUsername,
} from "@citizenwallet/sdk";

export const resolveAccountAddress = async ({
  value,
  config,
}: {
  value: string;
  config: Config;
}) => {
  const community = new CommunityConfig(config);

  if (isAddress(value)) {
    return value;
  }

  const ipfsDomain = community.ipfs.url.replace("https://", "");

  const profile = await getProfileFromUsername(ipfsDomain, community, value);

  if (profile) {
    return profile.account;
  }

  const ensAddress = await getENSAddress(community.primaryRPCUrl, value);

  if (ensAddress) {
    return ensAddress;
  }

  return null;
};
