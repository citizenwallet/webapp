import { Core } from "@walletconnect/core";
import { WalletKit, IWalletKit } from "@reown/walletkit";
import { CommunityConfig, Config } from "@citizenwallet/sdk";
import {
  buildApprovedNamespaces,
  populateAuthPayload as WC_populateAuthPayload,
} from "@walletconnect/utils";
import {
  ProposalTypes,
  SessionTypes,
  CoreTypes,
  AuthTypes,
} from "@walletconnect/types";
import { keccak256 } from "ethers/crypto";
import { toUtf8Bytes } from "ethers";

export const SUPPORTED_METHODS = [
  "eth_sign",
  "eth_signTransaction",
  "eth_sendTransaction",
  "personal_sign",
];
export const SUPPORTED_EVENTS = [
  "chainChanged",
  "accountsChanged",
  "message",
  "disconnect",
  "connect",
];

// Define a new type that extends Abi with an 'id' property
// export type ExtendedAbiFunction = Abi & {Abi id: string }[];
export type AbiInput = {
  internalType: string;
  name: string;
  type: string;
};

export type AbiOutput = {
  internalType?: string;
  name?: string;
  type: string;
};

export type AbiItem = {
  inputs: AbiInput[];
  outputs: AbiOutput[];
  name: string;
  stateMutability: "pure" | "view" | "nonpayable" | "payable";
  type: "function" | "constructor" | "event" | "fallback" | "receive";
};

export type Abi = AbiItem[];

export type ExtendedAbiItem = AbiItem & {
  id: string;
  signature: string;
};

export interface ContractData {
  SourceCode: string;
  ABI: string;
  ContractName: string;
  CompilerVersion: string;
  OptimizationUsed: string;
  Runs: string;
  ConstructorArguments: string;
  EVMVersion: string;
  Library: string;
  LicenseType: string;
  Proxy: string;
  Implementation: string;
  SwarmSource: string;
}

class WalletKitService {
  private static instance: WalletKitService | null = null;
  private static walletKit: IWalletKit | null = null;
  private static config: Config;
  static communityConfig: CommunityConfig;

  static async createInstance(config: Config): Promise<void> {
    if (WalletKitService.instance) return;

    WalletKitService.config = config;
    WalletKitService.communityConfig = new CommunityConfig(config);

    try {
      if (!process.env.NEXT_PUBLIC_REOWN_PROJECT_ID) {
        throw new Error("NEXT_PUBLIC_REOWN_PROJECT_ID is not set");
      }

      const core = new Core({
        projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
      });

      const { community: walletCommunity } = config;

      const walletMetadata: CoreTypes.Metadata = {
        name: walletCommunity.name,
        description: walletCommunity.description,
        url: walletCommunity.url,
        icons: [walletCommunity.logo],
        verifyUrl: undefined,
        redirect: {
          native: undefined,
          universal: undefined,
          linkMode: false,
        },
      };

      WalletKitService.walletKit = await WalletKit.init({
        core,
        metadata: walletMetadata,
      });
    } catch (e) {
      console.error("Error creating WalletKitService instance", e);
    }
  }

  static getWalletKit(): IWalletKit | null {
    return WalletKitService.walletKit;
  }

  static buildNamespaces(
    proposal: ProposalTypes.Struct,
    account: string
  ): SessionTypes.Namespaces {
    const chainId = WalletKitService.communityConfig.primaryToken.chain_id;

    const approvedNamespaces = buildApprovedNamespaces({
      proposal: proposal,
      supportedNamespaces: {
        eip155: {
          chains: [`eip155:${chainId}`],
          methods: SUPPORTED_METHODS,
          events: SUPPORTED_EVENTS,
          accounts: [`eip155:${chainId}:${account}`],
        },
      },
    });

    return approvedNamespaces;
  }

  static populateAuthPayload(
    payloadParams: AuthTypes.PayloadParams,
    account: string
  ) {
    if (!WalletKitService.walletKit) return;
    const chainId = WalletKitService.communityConfig.primaryToken.chain_id;
    const supportedChains = [`eip155:${chainId}`];

    const authPayload = WC_populateAuthPayload({
      authPayload: payloadParams,
      chains: supportedChains,
      methods: SUPPORTED_METHODS,
    });

    const iss = `eip155:${chainId}:${account}`;

    const message = WalletKitService.walletKit.formatAuthMessage({
      request: authPayload,
      iss,
    });

    return message;
  }

  static async getContractDetails(
    community: CommunityConfig,
    address: string
  ): Promise<null | ContractData> {
    const explorerApi = "https://api.gnosisscan.io/api"; // TODO: add to community.json file

    let response = await fetch(
      `${explorerApi}?module=contract&action=getsourcecode&address=${address}&apikey=${process.env.NEXT_PUBLIC_GNOSIS_SCAN_API_KEY}`
    );
    let data = await response.json();

    if (
      data.status !== "1" ||
      data.message !== "OK" ||
      data.result.length === 0 ||
      !data.result[0].ContractName
    ) {
      console.error("Failed to fetch contract details:", data.message);
      return null;
    }

    let result = data.result[0];

    const implementation = result.Implementation;
    if (implementation) {
      response = await fetch(
        `${explorerApi}?module=contract&action=getsourcecode&address=${implementation}&apikey=${process.env.NEXT_PUBLIC_GNOSIS_SCAN_API_KEY}`
      );
      data = await response.json();

      if (
        data.status !== "1" ||
        data.message !== "OK" ||
        data.result.length === 0 ||
        !data.result[0].ContractName
      ) {
        console.error("Failed to fetch contract details:", data.message);
        return null;
      }

      result = data.result[0];
    }

    return {
      SourceCode: result.SourceCode,
      ABI: result.ABI,
      ContractName: result.ContractName,
      CompilerVersion: result.CompilerVersion,
      OptimizationUsed: result.OptimizationUsed,
      Runs: result.Runs,
      ConstructorArguments: result.ConstructorArguments,
      EVMVersion: result.EVMVersion,
      Library: result.Library,
      LicenseType: result.LicenseType,
      Proxy: result.Proxy,
      Implementation: result.Implementation,
      SwarmSource: result.SwarmSource,
    };
  }

  static parseAbi(rawAbi: string): ExtendedAbiItem[] {
    const abi: AbiItem[] = JSON.parse(rawAbi);

    return abi
      .filter((v) => v.type === "function")
      .map((v) => ({
        ...v,
        id: `${v.name}(${v.inputs.reduce(
          (acc, input, i) =>
            i === 0
              ? `${acc}${input.name} ${input.type}`
              : `${acc},${input.name} ${input.type}`,
          ""
        )})`,
        signature: keccak256(
          toUtf8Bytes(
            `${v.name}(${v.inputs.reduce(
              (acc, input, i) =>
                i === 0 ? `${acc}${input.type}` : `${acc},${input.type}`,
              ""
            )})`
          )
        ).slice(0, 10),
        selected: false,
      }));
  }
}

export default WalletKitService;
