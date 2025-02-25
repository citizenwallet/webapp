import Tx from "@/containers/tx";
import Transaction404 from "@/containers/404/Transaction";
import { readCommunityFile } from "@/services/config";
import {
  getBurnerProfile,
  getEmptyProfile,
  getMinterProfile,
} from "@/state/profiles/state";
import { CommunityConfig, LogsService, getProfileFromAddress } from "@citizenwallet/sdk";
import { Suspense } from "react";
import { ZeroAddress } from "ethers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    hash: string;
  }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;

  const {
    hash
  } = params;

  const config = readCommunityFile();

  if (!config) {
    return <div>Community not found</div>;
  }

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

    const txFrom = logData['from'];
    const txTo = logData['to'];

    let fromProfile = (await getProfileFromAddress(communityConfig.ipfs.url, communityConfig, txFrom)) ?? getEmptyProfile(txFrom);
    
    if (ZeroAddress === txFrom) {
      fromProfile = getMinterProfile(txFrom, config.community);
    }

    let toProfile = (await getProfileFromAddress(communityConfig.ipfs.url, communityConfig, txTo)) ?? getEmptyProfile(txTo);
  
    if (ZeroAddress === txTo) {
      toProfile = getBurnerProfile(txTo, config.community);
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Tx
          tx={object}
          fromProfile={fromProfile}
          toProfile={toProfile}
          config={config}
        />
      </Suspense>
    );
  } catch (error) {}

  return <Transaction404 />;
}
