import { useMemo } from "react";
import { SendState, useSendStore } from "./state";
import { StoreApi, UseBoundStore } from "zustand";
import {
  QRFormat,
  parseAliasFromReceiveLink,
  parseMessageFromReceiveLink,
  parseQRCode,
  parseQRFormat,
} from "@citizenwallet/sdk";
import { isHexString } from "ethers";

class SendLogic {
  state: SendState;
  constructor(state: SendState) {
    this.state = state;
  }

  parseQRCode(data: string) {
    try {
      const format = parseQRFormat(data);
      if (format === QRFormat.voucher || format === QRFormat.unsupported) {
        throw new Error("Unsupported QR code format");
      }

      const alias = parseAliasFromReceiveLink(data);
      if (!alias) {
        throw new Error("QR code from another community");
      }

      const [to, amount] = parseQRCode(data);
      if (!to) {
        throw new Error("Invalid QR code");
      }
      this.updateTo(to);
      this.updateResolvedTo(to);

      if (amount) {
        this.updateAmount(amount);
      }

      if (format === QRFormat.receiveUrl) {
        const message = parseMessageFromReceiveLink(data);

        if (message) {
          this.updateDescription(message);
        }
      }

      return to;
    } catch (error) {
      console.error("Error parsing QR code", error);
    }

    return null;
  }

  setModalOpen(modalOpen: boolean) {
    this.state.setModalOpen(modalOpen);
  }

  updateTo(to: string) {
    if (to.length === 42 && isHexString(to)) {
      this.state.updateResolvedTo(to);
    }
    this.state.updateTo(to);
  }

  updateAmount(amount: string) {
    this.state.updateAmount(amount);
  }

  updateResolvedTo(resolvedTo: string) {
    this.state.updateResolvedTo(resolvedTo);
  }

  updateDescription(description: string) {
    this.state.updateDescription(description);
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
