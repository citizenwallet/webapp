import Profile from "@/containers/profile";
import Transaction404 from "@/containers/404/Transaction";
import { getConfig } from "@/services/config";
import { getEmptyProfile, getMinterProfile } from "@/state/profiles/state";
import { ProfileService, generateReceiveLink } from "@citizenwallet/sdk";
import { Suspense } from "react";
import { ZeroAddress } from "ethers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    address: string;
  };
}

export default async function Page({ params: { address } }: PageProps) {
  const config = getConfig();

  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
  if (!baseUrl) {
    throw new Error("Base URL not set");
  }

  try {
    const profiles = new ProfileService(config);

    let profile =
      (await profiles.getProfile(address)) ?? getEmptyProfile(address);
    if (ZeroAddress === address) {
      profile = getMinterProfile(address, config.community);
    }

    const receiveLink = generateReceiveLink(
      baseUrl,
      profile.account,
      config.community.alias
    );

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Profile config={config} profile={profile} receiveLink={receiveLink} />
      </Suspense>
    );
  } catch (error) {}

  return <Transaction404 />;
}
