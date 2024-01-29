"use client";

import { useRouter } from "next/navigation";

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
  PrimaryButton,
  OutlinedPrimaryButton,
} from "@/components/buttons";
import WalletLayout from "@/layouts/Wallet";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";

import LogoIcon from "@/assets/icons/logo.svg";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons/faEllipsis";
import { TransactionListWrapper, WhiteGradient } from "./styles";
import {
  CurrencyAmountLarge,
  CurrencySymbolLarge,
  SubtleSubtitle,
  Text,
  TextBold,
} from "@/components/text";
import { useTransactionStore } from "@/state/transactions/state";
import { useTransactionLogic } from "@/state/transactions/logic";
import { useEffect } from "react";
import TransactionRow from "@/components/TransactionRow";
import Image from "next/image";

import SpinnerIcon from "@/assets/icons/spinner.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCommunitiesStore } from "@/state/communities/state";
import { useCommunitiesLogic } from "@/state/communities/logic";

export default function Wallet() {
  const router = useRouter();

  const communityStore = useCommunitiesStore();
  const communityLogic = useCommunitiesLogic(communityStore, "gt.celo");

  const txStore = useTransactionStore();
  const logic = useTransactionLogic(txStore);

  useEffect(() => {
    communityLogic.fetchCommunity();
    logic.fetchTransactions();
  }, [communityLogic, logic]);

  const handleQRCode = () => {
    console.log("QRCode");
  };

  const handleTransactionClick = (txid: string) => {
    router.push(`wallet/tx/${txid}`);
  };

  const communityLoading = useCommunitiesStore((state) => state.loading);
  const community = useCommunitiesStore((state) => state.community);
  const loading = useTransactionStore((state) => state.loading);
  const txs = useTransactionStore((state) => state.transactions);

  return (
    <WalletLayout
      header={
        <Row>
          <Expanded />
          <Profile />
        </Row>
      }
      smallActions={
        <Column $fill>
          <Row $horizontal="center">
            <Profile src={LogoIcon} size={40} />
            <HorizontalSpacer />
            <CurrencyAmountLarge>42.00</CurrencyAmountLarge>
            <HorizontalSpacer $spacing={0.5} />
            <CurrencySymbolLarge>RGN</CurrencySymbolLarge>
          </Row>
          <VerticalSpacer $spacing={2} />
          <Row $horizontal="space-between">
            <HorizontalSpacer $spacing={0.5} />
            <Column>
              <PrimaryButton>
                <Row>
                  <Text fontSize="0.8rem">Send</Text>
                  <HorizontalSpacer $spacing={0.5} />
                  <FontAwesomeIcon icon={faArrowUp} size="xs" />
                </Row>
              </PrimaryButton>
            </Column>
            <Column>
              <PrimaryButton>
                <Row>
                  <Text fontSize="0.8rem">Receive</Text>
                  <HorizontalSpacer $spacing={0.5} />
                  <FontAwesomeIcon icon={faArrowDown} size="xs" />
                </Row>
              </PrimaryButton>
            </Column>
            <Column>
              <OutlinedPrimaryButton>
                <Row>
                  <Text fontSize="0.8rem">More</Text>
                  <HorizontalSpacer $spacing={0.5} />
                  <FontAwesomeIcon icon={faEllipsis} size="xs" />
                </Row>
              </OutlinedPrimaryButton>
            </Column>
            <HorizontalSpacer $spacing={0.5} />
          </Row>
        </Column>
      }
      actions={
        <Column $fill>
          <Profile src={LogoIcon} size={80} />
          <VerticalSpacer />
          <SubtleSubtitle>
            {communityLoading || !community ? "..." : community.community.name}
          </SubtleSubtitle>
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
        {loading && txs.length == 0 && (
          <>
            <VerticalSpacer $spacing={3} />
            <Row $horizontal="center">
              <Image
                src={SpinnerIcon}
                alt="loading spinner"
                height={30}
                width={30}
              />
            </Row>
          </>
        )}
        {txs.map((tx) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            onClick={handleTransactionClick}
          />
        ))}
      </TransactionListWrapper>
      <WhiteGradient style={{ position: "fixed", bottom: 0 }} />
      <OutlinedIconButton
        style={{ position: "fixed", bottom: "40px" }}
        icon={faQrcode}
        size="2x"
        onClick={handleQRCode}
      />
    </WalletLayout>
  );
}
