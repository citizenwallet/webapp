import {
  WebAuthnCredential,
} from "@simplewebauthn/server";

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
      (passkey) => passkey.id === credential.id
    );
    if (!passkeyExists) {
      existingPasskeys.push(credential);
      localStorage.setItem(
        `${this.alias}_${StorageKeys.PASSKEY}`,
        JSON.stringify(existingPasskeys)
      );
    }
  }

  getAllPasskeys(): WebAuthnCredential[] {
    const passkeys = localStorage.getItem(
      `${this.alias}_${StorageKeys.PASSKEY}`
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
  SESSION_PRIVATE_KEY: "session_private_key",
  SESSION_HASH: "session_hash",
  SESSION_SOURCE_VALUE: "session_source_value",
  SESSION_SOURCE_TYPE: "session_source_type",
  PASSKEY: "passkey",

  // for passkeys
  SESSION_CHALLENGE_HASH: "session_challenge_hash",
  SESSION_CHALLENGE_EXPIRY: "session_challenge_expiry",

  HASH: "hash", //hash of local accounts
} as const;

export type StorageKey = keyof typeof StorageKeys;
