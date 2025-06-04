import { useMemo } from "react";
import { ReceiveState, useReceiveStore } from "./state";
import { StoreApi, UseBoundStore } from "zustand";

class SendLogic {
  state: ReceiveState;
  constructor(state: ReceiveState) {
    this.state = state;
  }

  updateAmount(amount: string) {
    this.state.updateAmount(amount);
  }

  updateDescription(description: string) {
    this.state.updateDescription(description);
  }

  clear() {
    this.state.clear();
  }
}

export const useReceive = (): [
  UseBoundStore<StoreApi<ReceiveState>>,
  SendLogic,
] => {
  const receiveStore = useReceiveStore;

  const actions = useMemo(
    () => new SendLogic(receiveStore.getState()),
    [receiveStore],
  );

  return [receiveStore, actions];
};
