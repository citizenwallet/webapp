import { SendState } from "./state";

export const selectCanSend = (balance: string) => (state: SendState) => {
  const amount = parseFloat(state.amount);
  const balanceNumber = parseFloat(balance);

  return state.resolvedTo !== null && amount > 0 && amount <= balanceNumber;
};
