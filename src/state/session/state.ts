import { create } from "zustand";
import { WebAuthnCredential } from "@simplewebauthn/server";
export type AuthMethod = "passkey" | "local" | "email";

export interface SessionState {
  sourceValue: string | null;
  sourceType: string | null;
  privateKey: string | null;
  hash: string | null; // convert to bytes when signing
  passkeys: WebAuthnCredential[];
  isLoading: boolean;
  authMethod: AuthMethod | null;
  accountAddress: string | null;
  isReadOnly: boolean;
  isSessionExpired: boolean;


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

  setAuthMethod: (authMethod: AuthMethod | null) => void;
  setAccountAddress: (accountAddress: string | null) => void;
  setIsReadOnly: (isReadOnly: boolean) => void;
  setIsSessionExpired: (isSessionExpired: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;

  clear: () => void;
}

const initialState = () => ({
  sourceValue: null,
  sourceType: null,
  privateKey: null,
  hash: null,
  passkeys: [],
  isLoading: true,
  authMethod: null,
  accountAddress: null,
  isReadOnly: true,
  isSessionExpired: false,
});

export const useSessionStore = create<SessionState>()((set) => ({
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

  setAuthMethod: (authMethod: AuthMethod | null) => set({ authMethod }),
  setAccountAddress: (accountAddress: string | null) => set({ accountAddress }),
  setIsReadOnly: (isReadOnly: boolean) => set({ isReadOnly }),
  setIsSessionExpired: (isSessionExpired: boolean) => set({ isSessionExpired }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  clear: () => set(initialState()),
}));
