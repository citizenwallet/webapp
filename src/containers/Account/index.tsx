"use client";

import { useSearchParams, useRouter } from "next/navigation";

import RoundedImage from "@/components/RoundedImage";
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
import AccountLayout from "@/layouts/Account";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";

import LogoIcon from "@/assets/icons/logo.svg";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons/faEllipsis";
import {
  ActionsWrapper,
  TransactionListWrapper,
  WhiteGradient,
  ActionBar,
  ActionBarSmall
} from "./styles";

import {
  CurrencyAmountLarge,
  CurrencySymbolLarge,
  SubtleSubtitle,
  Text,
  TextBold,
} from "@/components/text";

import SendAction from "@/components/SendAction";
import ReceiveAction from "@/components/ReceiveAction";


import { formatBigIntAmount } from "@/utils/amount";

import { useAccountLogic } from "@/state/account/logic";
import { useEffect, useState } from "react";
import TransactionRow from "@/components/TransactionRow";
import Image from "next/image";

import SpinnerIcon from "@/assets/icons/spinner.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCommunitiesStore } from "@/state/communities/state";
import { useCommunitiesLogic } from "@/state/communities/logic";
import { useScrollPosition } from "@/hooks/page";
import { delay } from "@/utils/delay";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { ConfigType } from "@/types/config";

import { useAccountState } from "@/state/account/state";

interface AccountProps {
  config: ConfigType
}

export default function Account(props: AccountProps) {
  const { config } = props;
  const position = useScrollPosition();

  // const state = useAccountState();

  const [more, setMore] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const address = searchParams.get("address") || "";

  const communityStore = useCommunitiesStore();
  const communityLogic = useCommunitiesLogic(communityStore, "gt.celo");

  const logic = useAccountLogic(config);

  useEffect(() => {
    logic.fetchBalance(address);
    logic.fetchTransactions(address);

  }, [communityLogic, logic, address]);

  useEffect(() => {
    if (more && position > 100) {
      console.log("set more false");
      setMore(false);
    }
  }, [position, more]);

  const handleQRCode = () => {
    console.log("QRCode");
  };

  const handleMore = async () => {
    if (position > 100) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      await delay(650);
    }
    setMore(!more);
  };

  const handleTransactionClick = (txid: string) => {
    router.push(`Account/tx?txid=${txid}`);
  };

  const communityLoading = useCommunitiesStore((state) => state.loading);
  const community = useCommunitiesStore((state) => state.community);
  const loading = useAccountState((state) => state.loading);
  const txs = useAccountState((state) => state.transactions);
  const balance = useAccountState((state) => formatBigIntAmount(state.balance, navigator.language, config.token.decimals));

  const showSmall = position > 100;



  
const actions = (<Column $fill>
  <RoundedImage src={config.community.logo || LogoIcon} size={80} />
  <VerticalSpacer />
  <SubtleSubtitle>
    {communityLoading || !community ? "..." : community.community.name}
  </SubtleSubtitle>
  <VerticalSpacer />
  <Row $horizontal="center">
    <CurrencyAmountLarge>{balance}</CurrencyAmountLarge>
    <HorizontalSpacer $spacing={0.5} />
    <CurrencySymbolLarge>RGN</CurrencySymbolLarge>
  </Row>
  <VerticalSpacer $spacing={2} />
  <Row $horizontal="space-between">
    <HorizontalSpacer $spacing={0.5} />
    <Column>
      <SendAction variant="vertical" config={config} address={address} />
    </Column>
    <Column>
      <ReceiveAction variant="vertical" config={config} address={address} />
    </Column>
    <Column>
      <OutlinedIconButton
        icon={faEllipsis}
        size="2x"
        $shadow
        onClick={handleMore}
      />
      <VerticalSpacer $spacing={0.5} />
      <TextBold>More</TextBold>
    </Column>
    <HorizontalSpacer $spacing={0.5} />
  </Row>
</Column>);

const smallActions = (<Column $fill>
  <Row $horizontal="center">
    <RoundedImage src={config.community.logo} size={40} />
    <HorizontalSpacer />
    <CurrencyAmountLarge>{balance}</CurrencyAmountLarge>
    <HorizontalSpacer $spacing={0.5} />
    <CurrencySymbolLarge>RGN</CurrencySymbolLarge>
  </Row>
  <VerticalSpacer $spacing={2} />
  <Row $horizontal="space-between">
    <HorizontalSpacer $spacing={0.5} />
    <Column>
      <SendAction variant="horizontal" config={config} address={address} />
    </Column>
    <Column>
      <ReceiveAction variant="horizontal" config={config} address={address} />
    </Column>
    <Column>
      <OutlinedPrimaryButton onClick={handleMore}>
        <Row>
          <Text fontSize="0.8rem">More</Text>
          <HorizontalSpacer $spacing={0.5} />
          <FontAwesomeIcon icon={faEllipsis} size="xs" />
        </Row>
      </OutlinedPrimaryButton>
    </Column>
    <HorizontalSpacer $spacing={0.5} />
  </Row>
</Column>);

  return (
    <AccountLayout
      header={
        <Row>
          <Expanded />
          <RoundedImage />
        </Row>
      }
    >
            {actions && !showSmall && <ActionBar>{actions}</ActionBar>}
      {smallActions && showSmall && (
        <ActionBarSmall>{smallActions}</ActionBarSmall>
      )}


      <ActionsWrapper $show={more}>
        <Divider style={{ width: "80%" }} />
        <VerticalSpacer />
        <Row>
          <HorizontalSpacer $spacing={3} />
          <OutlinedIconButton icon={faPlus} size="sm" />
          <HorizontalSpacer />
          <Expanded>
            <TextBold>Top up</TextBold>
          </Expanded>
          <HorizontalSpacer $spacing={3} />
        </Row>
        <VerticalSpacer />
        <Row>
          <HorizontalSpacer $spacing={3} />
          <OutlinedIconButton icon={faEllipsis} size="sm" />
          <HorizontalSpacer />
          <Expanded>
            <TextBold>Custom Action</TextBold>
          </Expanded>
          <HorizontalSpacer $spacing={3} />
        </Row>
        <VerticalSpacer />
        <Row>
          <HorizontalSpacer $spacing={3} />
          <OutlinedIconButton icon={faUsers} size="sm" />
          <HorizontalSpacer />
          <Expanded>
            <TextBold>View Community Dashboard</TextBold>
          </Expanded>
          <HorizontalSpacer $spacing={3} />
        </Row>
        <VerticalSpacer />
      </ActionsWrapper>
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
        $shadow
        onClick={handleQRCode}
      />
    </AccountLayout>
  );
}
