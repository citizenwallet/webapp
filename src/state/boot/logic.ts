import { useRef } from "react";
import { ethers } from "ethers";
import { BootStateType, useBootState } from "@/state/boot/state";
import { ConfigType } from "@/types/config";
import { JsonRpcProvider } from "ethers";
import accountFactoryContractAbi from "smartcontracts/build/contracts/accfactory/AccountFactory.abi.json";

class BootLogic {
  constructor(private state: BootStateType, private config: ConfigType) {
    this.state = state;
  }

  create = () => {
    const wallet = ethers.Wallet.createRandom();
    window.localStorage.setItem("cw-privateKey", wallet.privateKey);
    return wallet;
  }

  import = (privateKey: string) => {
    return new ethers.Wallet(privateKey);
  }

  createOrRestore = async () : Promise<string | undefined> => {
    this.state.boot();
    let wallet;
    try {
      const privateKey = window.localStorage.getItem("cw-privateKey");
      if (privateKey) {
        wallet = this.import(privateKey);
      } else {
        wallet = this.create();
      }

      // Fetch the account address
      let accountAddress = window.localStorage.getItem("cw-accountAddress");
      if (!accountAddress) {
        const provider = new JsonRpcProvider(this.config.node.url);
        const factoryContract = new ethers.Contract(
          this.config.erc4337.account_factory_address,
          accountFactoryContractAbi,
          provider
        );
        accountAddress = await factoryContract.getFunction("getAddress")(wallet.address, BigInt(0));
        if (!accountAddress) {
          throw new Error("Unable to fetch account address");
        }
        window.localStorage.setItem("cw-accountAddress", accountAddress);
      }
      this.state.bootSuccess();
      return accountAddress;
    } catch (e) {
      console.error(e);
      this.state.bootFailed();
    }
  }
}

export const useBootLogic = (config: ConfigType) => {
  const state = useBootState();
  const logicRef = useRef(new BootLogic(state, config));
  return logicRef.current;
};
