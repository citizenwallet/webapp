import { AccountState } from "./state";

export const selectOrderedLogs = (state: AccountState) => {
  return [...state.logs].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};
