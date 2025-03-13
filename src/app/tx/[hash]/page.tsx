import Tx from "@/containers/tx";
import Transaction404 from "@/containers/404/Transaction";
import { getCommunityFromHeaders, readCommunityFile } from "@/services/config";
import {
  getBurnerProfile,
  getEmptyProfile,
  getMinterProfile,
} from "@/state/profiles/state";
import {
  CommunityConfig,
  Config,
  LogsService,
  getProfileFromAddress,
} from "@citizenwallet/sdk";
import { Suspense } from "react";
import { ZeroAddress } from "ethers";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    hash: string;
  }>;
}

export default async function Page(props: PageProps) {
  const headersList = await headers();

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return <div>Community not found</div>;
  }

  const params = await props.params;

  const { hash } = params;

  return (
    <Suspense fallback={<Tx config={config} />}>
      <AsyncPage config={config} hash={hash} />
    </Suspense>
  );
}

async function AsyncPage({ config, hash }: { config: Config; hash: string }) {
  const communityConfig = new CommunityConfig(config);
  const logsService = new LogsService(communityConfig);

  try {
    const { object } = await logsService.getLog(
      communityConfig.primaryToken.address,
      hash
    );

    const logData = object.data;

    if (!logData) {
      throw new Error("Log data not found");
    }

    const txFrom = logData["from"];
    const txTo = logData["to"];

    const ipfsDomain = communityConfig.ipfs.url.replace("https://", "");

    let fromProfile =
      (await getProfileFromAddress(ipfsDomain, communityConfig, txFrom)) ??
      getEmptyProfile(txFrom);

    if (ZeroAddress === txFrom) {
      fromProfile = getMinterProfile(txFrom, config.community);
    }

    let toProfile =
      (await getProfileFromAddress(ipfsDomain, communityConfig, txTo)) ??
      getEmptyProfile(txTo);

    if (ZeroAddress === txTo) {
      toProfile = getBurnerProfile(txTo, config.community);
    }

    return (
      <Tx
        tx={object}
        fromProfile={fromProfile}
        toProfile={toProfile}
        config={config}
      />
    );
  } catch (error) {}

  return <Transaction404 />;
}
