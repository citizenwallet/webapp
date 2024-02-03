export interface ConfigType {
  community: {
    name: string;
    description: string;
    url: string;
    alias: string;
    logo: string;
    customDomain?: string;
    hidden?: boolean;
  };
  scan: {
    url: string;
    name: string;
  };
  indexer: {
    url: string;
    ipfs_url: string;
    key: string;
  };
  ipfs: {
    url: string;
  };
  node: {
    chainId: number;
    url: string;
    ws_url: string;
  };
  erc4337: {
    rpc_url: string;
    paymaster_address?: string;
    entrypoint_address: string;
    account_factory_address: string;
    paymaster_rpc_url: string;
    paymaster_type: string;
    gas_extra_percentage?: number;
  };
  token: {
    address: string;
    standard: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  profile: {
    address: string;
  };
  plugins?: {
    name: string;
    icon: string;
    url: string;
  }[];
  version: number;
}
