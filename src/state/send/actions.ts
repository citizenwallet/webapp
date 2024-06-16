import { useMemo } from "react";
import { SendState, useSendStore } from "./state";
import { StoreApi, UseBoundStore } from "zustand";

class SendLogic {
  state: SendState;
  constructor(state: SendState) {
    this.state = state;
  }

  updateTo(to: string) {
    this.state.updateTo(to);
  }

  updateAmount(amount: string) {
    this.state.updateAmount(amount);
  }

  updateResolvedTo(resolvedTo: string) {
    this.state.updateResolvedTo(resolvedTo);
  }

  cancelToSelection() {
    this.state.updateResolvedTo(null);
  }

  clear() {
    this.state.clear();
  }
}

export const useSend = (): [UseBoundStore<StoreApi<SendState>>, SendLogic] => {
  const sendStore = useSendStore;

  const actions = useMemo(
    () => new SendLogic(sendStore.getState()),
    [sendStore]
  );

  return [sendStore, actions];
};
