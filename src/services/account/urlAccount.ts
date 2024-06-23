import { HDNodeWallet, Wallet } from "ethers";

export const parsePrivateKeyFromHash = async (
  baseUrl: string,
  hash: string,
  walletPassword: string
): Promise<[string, HDNodeWallet | Wallet] | [undefined, undefined]> => {
  const encodedURL = new URL(`${baseUrl}/${hash.replace("#/", "")}`);
  const encoded = encodedURL.pathname.replace("/wallet/", "");

  try {
    if (!encoded.startsWith("v3-")) {
      throw new Error("Invalid wallet format");
    }

    const decoded = atob(encoded.replace("v3-", ""));

    const [account, encryptedPrivateKey] = decoded.split("|");
    if (!account || !encryptedPrivateKey) {
      throw new Error("Invalid wallet format");
    }

    const wallet = await Wallet.fromEncryptedJson(
      encryptedPrivateKey,
      walletPassword
    );

    return [account, wallet];
  } catch (e) {
    console.error(e);
  }

  return [undefined, undefined];
};

export const parseLegacyWalletFromHash = async (
  baseUrl: string,
  hash: string,
  walletPassword: string
): Promise<HDNodeWallet | Wallet | undefined> => {
  const encodedURL = new URL(`${baseUrl}/${hash.replace("#/", "")}`);
  const encoded = encodedURL.pathname.replace("/wallet/", "");

  try {
    if (!encoded.startsWith("v2-")) {
      throw new Error("Invalid wallet format");
    }

    const encryptedPrivateKey = atob(encoded.replace("v2-", ""));

    const wallet = await Wallet.fromEncryptedJson(
      encryptedPrivateKey,
      walletPassword
    );

    return wallet;
  } catch (e) {}

  return;
};

export const generateWalletHash = async (
  account: string,
  wallet: HDNodeWallet | Wallet,
  walletPassword: string
): Promise<string> => {
  const encryptedPrivateKey = await wallet.encrypt(walletPassword);

  const encoded = btoa(`${account}|${encryptedPrivateKey}`);

  return `v3-${encoded}`;
};
