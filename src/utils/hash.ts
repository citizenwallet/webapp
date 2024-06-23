export const generateAccountHashPath = (hash: string, alias: string) => {
  let hashPath = `${hash}?alias=${alias}`;
  if (!hash.startsWith("#/wallet/")) {
    hashPath = `#/wallet/${hashPath}`;
  }

  return hashPath;
};
