import { WebAuthnCredential } from "@simplewebauthn/server";

export class StorageService {
  alias: string;
  constructor(alias: string) {
    this.alias = alias;
  }

  setKey(key: StorageKey, value: string) {
    localStorage.setItem(`${this.alias}_${key}`, value);
  }

  getKey(key: StorageKey) {
    return localStorage.getItem(`${this.alias}_${key}`);
  }

  savePasskey(credential: WebAuthnCredential) {
    const existingPasskeys = this.getAllPasskeys();
    const passkeyExists = existingPasskeys.some(
      (passkey) => passkey.id === credential.id,
    );
    if (!passkeyExists) {
      existingPasskeys.push(credential);
      localStorage.setItem(
        `${this.alias}_${StorageKeys.passkey}`,
        JSON.stringify(existingPasskeys),
      );
    }
  }

  getAllPasskeys(): WebAuthnCredential[] {
    const passkeys = localStorage.getItem(
      `${this.alias}_${StorageKeys.passkey}`,
    );
    if (!passkeys) {
      return [];
    }

    const storedPasskeys = JSON.parse(passkeys) as any[];

    storedPasskeys.forEach((passkey) => {
      passkey.publicKey = new Uint8Array(Object.values(passkey.publicKey));
    });

    return storedPasskeys;
  }
}

export const StorageKeys = {
  session_private_key: "session_private_key",
  session_hash: "session_hash",
  session_source_value: "session_source_value",
  session_source_type: "session_source_type",
  passkey: "passkey",

  // for passkeys
  session_challenge_hash: "session_challenge_hash",
  session_challenge_expiry: "session_challenge_expiry",

  hash: "hash", //hash of local accounts
} as const;

export type StorageKey = keyof typeof StorageKeys;
