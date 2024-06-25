import { HDNodeWallet, Wallet, getBytes } from "ethers";

export const parsePrivateKeyFromHash = async (
  baseUrl: string,
  hash: string,
  walletPassword: string
): Promise<[string, HDNodeWallet | Wallet] | [undefined, undefined]> => {
  console.log("baseUrl", `${baseUrl}/${hash.replace("#/", "")}`);
  const encodedURL = new URL(`${baseUrl}/${hash.replace("#/", "")}`);
  const encoded = encodedURL.pathname.replace("/wallet/", "");

  try {
    if (!encoded.startsWith("v3-")) {
      throw new Error("Invalid wallet format");
    }

    console.log("encoded", encoded);

    const decoded = atob(encoded.replace("v3-", ""));

    const [account, encryptedPrivateKey] = decoded.split("|");
    if (!account || !encryptedPrivateKey) {
      throw new Error("Invalid wallet format");
    }

    console.log("encryptedPrivateKey", encryptedPrivateKey);
    console.log("walletPassword", walletPassword);

    const jsonPrivateKey = JSON.parse(encryptedPrivateKey);
    // console.log("jsonPrivateKey", jsonPrivateKey.crypto.ciphertext.length);

    // console.log(
    //   "jsonPrivateKey.crypto.ciphertext",
    //   getBytes(jsonPrivateKey.crypto.ciphertext)
    // );

    // jsonPrivateKey.crypto.ciphertext = jsonPrivateKey.crypto.ciphertext.slice(
    //   0,
    //   -2
    // );
    // jsonPrivateKey.crypto.ciphertext =
    //   jsonPrivateKey.crypto.ciphertext.slice(2);

    // console.log("jsonPrivateKey", jsonPrivateKey.crypto.ciphertext.length);

    const wallet = await Wallet.fromEncryptedJson(
      encryptedPrivateKey,
      walletPassword
    );

    console.log(wallet);

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
