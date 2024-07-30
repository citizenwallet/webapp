import { PasskeyArgType, extractPasskeyData } from "@safe-global/protocol-kit";
import { STORAGE_PASSKEY_LIST_KEY } from "./constants";

export async function createPasskey(): Promise<PasskeyArgType> {
  const displayName = "Anonymous";
  const passkeyCredential = await navigator.credentials.create({
    publicKey: {
      pubKeyCredParams: [
        {
          alg: -7,
          type: "public-key",
        },
      ],
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: "Safe SmartAccount",
      },
      user: {
        displayName,
        id: crypto.getRandomValues(new Uint8Array(32)),
        name: displayName,
      },
      timeout: 60_000,
      attestation: "none",
    },
  });

  if (!passkeyCredential) {
    throw Error("Passkey creation failed: No credential was returned.");
  }
  console.log("passkeyCredential: ", passkeyCredential);

  const passkey = await extractPasskeyData(passkeyCredential);
  console.log("Created Passkey: ", passkey);

  return passkey;
}

export function storePasskeyInLocalStorage(passkey: PasskeyArgType) {
  const passkeys = loadPasskeysFromLocalStorage();

  passkeys.push(passkey);

  localStorage.setItem(STORAGE_PASSKEY_LIST_KEY, JSON.stringify(passkeys));
}

export function loadPasskeysFromLocalStorage(): PasskeyArgType[] {
  const passkeysStored = localStorage.getItem(STORAGE_PASSKEY_LIST_KEY);

  const passkeyIds = passkeysStored ? JSON.parse(passkeysStored) : [];

  return passkeyIds;
}

export function getPasskeyFromRawId(passkeyRawId: string): PasskeyArgType {
  const passkeys = loadPasskeysFromLocalStorage();

  const passkey = passkeys.find((passkey) => passkey.rawId === passkeyRawId)!;

  return passkey;
}
