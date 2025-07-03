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
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const metadata: Metadata = {
    title: "Citizen Wallet",
    description: "The open source wallet for your community.",
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title: "Citizen Wallet",
      description: "The open source wallet for your community.",
      images: ["/logo.png"],
    },
  };

  const headersList = await headers();

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return metadata;
  }

  metadata.title = config.community.name;
  metadata.description = config.community.description;
  metadata.openGraph = {
    title: config.community.name,
    description: config.community.description,
    images: [config.community.logo],
    type: "article",
  };

  return metadata;
}

interface PageProps {
  params: Promise<{
    hash: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function Page(props: PageProps) {
  const headersList = await headers();

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return <div>Community not found</div>;
  }

  const params = await props.params;
  const searchParams = await props.searchParams;

  const { hash } = params;
  const { token } = searchParams;

  return (
    <Suspense fallback={<Tx config={config} />}>
      <AsyncPage config={config} hash={hash} token={token} />
    </Suspense>
  );
}

async function AsyncPage({
  config,
  hash,
  token,
}: {
  config: Config;
  hash: string;
  token?: string;
}) {
  const communityConfig = new CommunityConfig(config);
  const logsService = new LogsService(communityConfig);

  try {
    const { object } = await logsService.getLog(
      communityConfig.getToken(token).address,
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
