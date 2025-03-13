import { Log } from "@citizenwallet/sdk";
import { create } from "zustand";
export interface AccountState {
  account: string;
  owner: boolean;
  balance: string;
  logs: Log[];
  sending: boolean;
  sendError: string | null;
  setAccount: (account: string) => void;
  setOwner: (owner: boolean) => void;
  setBalance: (balance: string) => void;
  replaceLogs: (logs: Log[]) => void;
  appendLogs: (logs: Log[]) => void;
  putLogs: (logs: Log[]) => void;
  sendRequest: () => void;
  sendSuccess: () => void;
  sendFailure: (error: string) => void;
  clear: () => void;
}

const initialState = () => ({
  account: "",
  owner: false,
  balance: "0.00",
  logs: [],
  sending: false,
  sendError: null,
});

export const useAccountStore = create<AccountState>((set) => ({
  ...initialState(),
  setAccount: (account) => set((state) => ({ account })),
  setOwner: (owner) => set((state) => ({ owner })),
  setBalance: (balance) => set((state) => ({ balance })),
  replaceLogs: (logs) => set((state) => ({ logs })),
  appendLogs: (logs) =>
    set((state) => {
      const existingLogs = [...state.logs];

      logs.forEach((log) => {
        const existingLog = existingLogs.find(
          (t) => t.hash === log.hash
        );

        if (!existingLog) {
          existingLogs.unshift(log);
        }
      });

      return { logs: existingLogs };
    }),
  putLogs: (logs) =>
    set((state) => {
      const existingLogs = [...state.logs];

      logs.forEach((log) => {
        const index = existingLogs.findIndex(
          (t) => t.hash === log.hash
        );

        if (index === -1) {
          existingLogs.push(log);
        } else {
          existingLogs[index] = log;
        }
      });

      return { logs: existingLogs };
    }),
  sendRequest: () => set((state) => ({ sending: true })),
  sendSuccess: () => set((state) => ({ sending: false })),
  sendFailure: (error) =>
    set((state) => ({ sending: false, sendError: error })),
  clear: () => set(initialState()),
}));
