"use client";

import Profile from "@/components/RoundedImage";
import {
  Column,
  Expanded,
  Row,
  VerticalSpacer,
  HorizontalSpacer,
  Divider,
} from "@/components/base";
import {
  AltIconButton,
  IconButton,
  OutlinedIconButton,
} from "@/components/buttons";
import WalletLayout from "@/layouts/Wallet";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";

import LogoIcon from "@/assets/icons/logo.svg";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons/faEllipsis";
import { TransactionListWrapper } from "./styles";
import {
  CurrencyAmountLarge,
  CurrencySymbolLarge,
  SubtleSubtitle,
  TextBold,
} from "@/components/text";
import { useTransactionStore } from "@/state/transactions/state";
import { useTransactionLogic } from "@/state/transactions/logic";
import { useEffect } from "react";
import TransactionRow from "@/components/TransactionRow";

export default function Wallet() {
  const txStore = useTransactionStore();
  const logic = useTransactionLogic(txStore);

  useEffect(() => {
    logic.fetchTransactions();
  }, [logic]);

  const handleQRCode = () => {
    console.log("QRCode");
  };

  const txs = useTransactionStore((state) => state.transactions);

  return (
    <WalletLayout
      header={
        <Row>
          <Expanded />
          <Profile />
        </Row>
      }
      actions={
        <Column $fill>
          <Profile src={LogoIcon} size={80} />
          <VerticalSpacer />
          <SubtleSubtitle>Community Name</SubtleSubtitle>
          <VerticalSpacer />
          <Row $horizontal="center">
            <CurrencyAmountLarge>42.00</CurrencyAmountLarge>
            <HorizontalSpacer $spacing={0.5} />
            <CurrencySymbolLarge>RGN</CurrencySymbolLarge>
          </Row>
          <VerticalSpacer $spacing={2} />
          <Row $horizontal="space-between">
            <HorizontalSpacer $spacing={0.5} />
            <Column>
              <IconButton icon={faArrowUp} size="2x" />
              <VerticalSpacer $spacing={0.5} />
              <TextBold>Send</TextBold>
            </Column>
            <Column>
              <IconButton icon={faArrowDown} size="2x" />
              <VerticalSpacer $spacing={0.5} />
              <TextBold>Receive</TextBold>
            </Column>
            <Column>
              <AltIconButton icon={faEllipsis} size="2x" />
              <VerticalSpacer $spacing={0.5} />
              <TextBold>More</TextBold>
            </Column>
            <HorizontalSpacer $spacing={0.5} />
          </Row>
        </Column>
      }
    >
      <TransactionListWrapper>
        <TextBold>Transaction history</TextBold>
        <VerticalSpacer $spacing={0.5} />
        <Divider />
        {txs.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </TransactionListWrapper>
      <OutlinedIconButton
        style={{ position: "fixed", bottom: "40px" }}
        icon={faQrcode}
        size="2x"
        onClick={handleQRCode}
      />
    </WalletLayout>
  );
}
