export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatUrl = (url: string) => {
  return `${url.slice(0, 26)}...${url.slice(-4)}`;
};
