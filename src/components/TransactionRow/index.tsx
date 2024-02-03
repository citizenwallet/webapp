import {
  Column,
  Expanded,
  HorizontalSpacer,
  Row,
  VerticalSpacer,
} from "../base";
import { TextSubtle, TextBold, CurrencyAmountSmall } from "../text";
import RoundedImage from "../RoundedImage";
import UserIcon from "@/assets/icons/user.svg";
import { TransactionType } from "@/services/indexer";
import { formatAddress } from "@/utils/address";
import { formatBigIntAmount } from "@/utils/amount";
interface TransactionRowProps {
  tx: TransactionType;
  locale: string;
  tokenSymbol: string;
  tokenDecimals: number;
  onClick?: (txid: string) => void;
}

export default function TransactionRow({ locale, tokenSymbol, tokenDecimals, tx, onClick }: TransactionRowProps) {
  const handleOnClick = () => {
    if (onClick) {
      onClick(tx.hash);
    }
  };

  return (
    <Column $fill key={tx.hash} onClick={handleOnClick}>
      <VerticalSpacer $spacing={0.5} />
      <Row>
        <HorizontalSpacer $spacing={0.5} />
        <RoundedImage src={UserIcon} size={42} />
        <HorizontalSpacer $spacing={0.5} />
        <Expanded>
          <Column $horizontal="start">
            <TextBold>{formatAddress(tx.from)}</TextBold>
            <VerticalSpacer $spacing={0.1} />
            <TextSubtle fontSize="0.8rem">
              {tx.data?.description || "no description"}
            </TextSubtle>
          </Column>
        </Expanded>
        <Column $horizontal="end">
          <CurrencyAmountSmall $positive={tx.value > 0}>
            {formatBigIntAmount(tx.value, locale, tokenDecimals)} {tokenSymbol}
          </CurrencyAmountSmall>
          <VerticalSpacer $spacing={0.1} />
          <TextSubtle>{tx.status}</TextSubtle>
        </Column>
        <HorizontalSpacer $spacing={0.5} />
      </Row>
      <VerticalSpacer $spacing={0.5} />
    </Column>
  );
}
