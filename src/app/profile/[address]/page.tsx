import Profile from "@/containers/profile";
import Transaction404 from "@/containers/404/Transaction";
import { readCommunityFile } from "@/services/config";
import { getEmptyProfile, getMinterProfile } from "@/state/profiles/state";
import {
  getProfileFromAddress,
  generateReceiveLink,
  CommunityConfig,
} from "@citizenwallet/sdk";
import { Suspense } from "react";
import { ZeroAddress } from "ethers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    address: string;
  }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;

  const { address } = params;

  const config = readCommunityFile();

  if (!config) {
    return <div>Community not found</div>;
  }

  const baseUrl = process.env.NEXT_PUBLIC_DEEPLINK_DOMAIN;
  if (!baseUrl) {
    throw new Error("Base URL not set");
  }

  const communityConfig = new CommunityConfig(config);

  try {
    let profile =
      (await getProfileFromAddress(
        communityConfig.ipfs.url,
        communityConfig,
        address
      )) ?? getEmptyProfile(address);
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
