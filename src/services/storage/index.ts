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
}

export const StorageKeys = {
  SESSION_PRIVATE_KEY: "session_private_key",
  SESSION_HASH: "session_hash",
  SESSION_SOURCE_VALUE: "session_source_value",
  SESSION_SOURCE_TYPE: "session_source_type",

  HASH: "hash", //hash of local accounts
} as const;

export type StorageKey = keyof typeof StorageKeys;
