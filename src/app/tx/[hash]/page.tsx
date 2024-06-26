import Tx from "@/containers/tx";
import Transaction404 from "@/containers/404/Transaction";
import { readCommunityFile } from "@/services/config";
import {
  getBurnerProfile,
  getEmptyProfile,
  getMinterProfile,
} from "@/state/profiles/state";
import { IndexerService, ProfileService } from "@citizenwallet/sdk";
import { Suspense } from "react";
import { ZeroAddress } from "ethers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    hash: string;
  };
}

export default async function Page({ params: { hash } }: PageProps) {
  const config = readCommunityFile();

  if (!config) {
    return <div>Community not found</div>;
  }

  const indexer = new IndexerService(config.indexer);

  try {
    const { object: tx } = await indexer.getTransfer(
      config.token.address,
      hash
    );

    const profiles = new ProfileService(config);

    let fromProfile =
      (await profiles.getProfile(tx.from)) ?? getEmptyProfile(tx.from);
    if (ZeroAddress === tx.from) {
      fromProfile = getMinterProfile(tx.from, config.community);
    }
    let toProfile =
      (await profiles.getProfile(tx.to)) ?? getEmptyProfile(tx.to);
    if (ZeroAddress === tx.to) {
      toProfile = getBurnerProfile(tx.to, config.community);
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Tx
          tx={tx}
          fromProfile={fromProfile}
          toProfile={toProfile}
          config={config}
        />
      </Suspense>
    );
  } catch (error) {}

  return <Transaction404 />;
}
