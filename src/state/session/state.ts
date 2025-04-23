import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { WebAuthnCredential } from "@simplewebauthn/server";

// TODO: remove devtools later

export interface SessionState {
  sourceValue: string | null;
  sourceType: string | null;
  privateKey: string | null;
  hash: string | null; // convert to bytes when signing
  passkeys: WebAuthnCredential[];

  setSourceValue: (sourceValue: string) => void;
  resetSourceValue: () => void;

  setSourceType: (sourceType: string) => void;
  resetSourceType: () => void;

  setPrivateKey: (privateKey: string) => void;
  resetPrivateKey: () => void;

  setHash: (hash: string) => void;
  resetHash: () => void;

  appendPasskey: (passkey: WebAuthnCredential) => void;
  resetPasskey: () => void;

  clear: () => void;
}

const initialState = () => ({
  sourceValue: null,
  sourceType: null,
  privateKey: null,
  hash: null,
  passkeys: [],
});

export const useSessionStore = create<SessionState>()(
  devtools((set) => ({
    ...initialState(),

    setSourceValue: (sourceValue) => set({ sourceValue }),
    resetSourceValue: () => set({ sourceValue: null }),

    setSourceType: (sourceType) => set({ sourceType }),
    resetSourceType: () => set({ sourceType: null }),

    setPrivateKey: (privateKey) => set({ privateKey }),
    resetPrivateKey: () => set({ privateKey: null }),

    setHash: (hash) => set({ hash }),
    resetHash: () => set({ hash: null }),

    appendPasskey: (passkey) =>
      set((state) => ({
        passkeys: [...state.passkeys, passkey],
      })),
    resetPasskey: () => set({ passkeys: [] }),

    clear: () => set(initialState()),
  })),
);
