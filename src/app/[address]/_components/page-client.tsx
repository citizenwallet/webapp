"use client";

import { Config } from "@citizenwallet/sdk";
import Wallet from "@/containers/wallet";
import { isAddress } from "ethers";
import { useProfiles } from "@/state/profiles/actions";
import { useEffect } from "react";
import { selectFilteredProfiles } from "@/state/profiles/selectors";

interface PageClientProps {
  config: Config;
  address: string;
}

export default function PageClient({ config, address }: PageClientProps) {
  const [profilesState, profilesActions] = useProfiles(config);

  useEffect(() => {
    if (!isAddress(address)) {
      profilesActions.loadProfileFromUsername(address);
    }
  }, [address, profilesActions]);

  if (isAddress(address)) {
    return <Wallet config={config} accountAddress={address} />;
  }

  const profiles = profilesState(selectFilteredProfiles(address));

  if (profiles.length > 0) {
    return <Wallet config={config} accountAddress={profiles[0].account} />;
  }
    
    // TODO: resolve ENS address

  return <div>PageClient</div>;
}
