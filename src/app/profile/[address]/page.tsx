import Profile from "@/containers/profile";
import Transaction404 from "@/containers/404/Transaction";
import { getCommunityFromHeaders, readCommunityFile } from "@/services/config";
import { getEmptyProfile, getMinterProfile } from "@/state/profiles/state";
import {
  getProfileFromAddress,
  generateReceiveLink,
  CommunityConfig,
  Config,
} from "@citizenwallet/sdk";
import { Suspense } from "react";
import { ZeroAddress } from "ethers";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    address: string;
  }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;

  const { address } = params;

  const headersList = await headers();

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return <div>Community not found</div>;
  }

  return (
    <Suspense fallback={<Profile config={config} />}>
      <AsyncPage config={config} address={address} />
    </Suspense>
  );
}

async function AsyncPage({
  config,
  address,
}: {
  config: Config;
  address: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_DEEPLINK_DOMAIN;
  if (!baseUrl) {
    throw new Error("Base URL not set");
  }

  const communityConfig = new CommunityConfig(config);

  try {
    const ipfsDomain = communityConfig.ipfs.url.replace("https://", "");

    let profile =
      (await getProfileFromAddress(ipfsDomain, communityConfig, address)) ??
      getEmptyProfile(address);
    if (ZeroAddress === address) {
      profile = getMinterProfile(address, config.community);
    }

    const receiveLink = generateReceiveLink(
      baseUrl,
      communityConfig,
      profile.account
    );

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Profile config={config} profile={profile} receiveLink={receiveLink} />
      </Suspense>
    );
  } catch (error) {}

  return <Transaction404 />;
}
