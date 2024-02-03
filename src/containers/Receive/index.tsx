"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG } from 'qrcode.react';

import RoundedImage from "@/components/RoundedImage";
import {
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
import ModalLayout from "@/layouts/Modal";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";

import LogoIcon from "@/assets/icons/logo.svg";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons/faEllipsis";
import {
  CurrencyAmountLarge,
  CurrencySymbolLarge,
  SubtleSubtitle,
  Text,
  TextBold,
} from "@/components/text";
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
import { getBigIntAmountFromString } from "@/utils/amount";
interface AccountProps {
  config: ConfigType
}

const BigAmount = function(amount: number, decimals: number) {
  return BigInt(amount * 10 ** decimals);
}


export default function Account(props: AccountProps) {
  const position = useScrollPosition();
  const searchParams = useSearchParams();
  const { config } = props;

  const address = searchParams.get("address") || "";

  let amount_uint256 = getBigIntAmountFromString(searchParams.get("amount") || "", config.token.decimals);

  // const numberFormatter = new Intl.NumberFormat(navigator.language, {
  //   style: "decimal",
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // });

  // https://usdc.base.citizenwallet.xyz/#/?receiveParams=H4sIAJZMvWUA_w3MQQ6DIBAAwK_0xNHsWghwIEYF_7EV2pAUMS4kfX6dB8xEMV6J2cEPgwVFEo1BGIOxCszo8S1hXrxW9qnDJrWOXtA3E7vOcR9exElQqf1oDmFQIMqd0Se5tXOr5eET71c-W67HH46OR_BrAAAA
  // https://usdc.base.citizenwallet.xyz/send?communitySlug=zinne&token=:tokenAddress&to=0x1234567890123456789012345678901234567890&amount=100&description=hello&publicKey=0x1234567890123456789012345678901234567890


  // ERC-681
  // ethereum:tokenAddress@chainId/transfer?address=accountAddress&uint256=amount&data=description
  // Deep link

  let erc681Address = `ethereum:${config.token.address}@${config.node.chainId}/transfer?address=${address}`;
  if (amount_uint256) {
    erc681Address += `&uint256=${amount_uint256}`;
  }
  console.log("erc681Address", erc681Address);
  return (
    <ModalLayout>
      <QRCodeSVG value={erc681Address} size={256} />
    </ModalLayout>
  );
}
