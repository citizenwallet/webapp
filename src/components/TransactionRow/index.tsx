import { Transaction } from "@/state/transactions/state";
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

interface TransactionRowProps {
  tx: Transaction;
  onClick?: (txid: string) => void;
}

export default function TransactionRow({ tx, onClick }: TransactionRowProps) {
  const handleOnClick = () => {
    if (onClick) {
      onClick(tx.id);
    }
  };

  return (
    <Column $fill key={tx.id} onClick={handleOnClick}>
      <VerticalSpacer $spacing={0.5} />
      <Row>
        <HorizontalSpacer $spacing={0.5} />
        <RoundedImage src={UserIcon} size={42} />
        <HorizontalSpacer $spacing={0.5} />
        <Expanded>
          <Column $horizontal="start">
            <TextBold>{tx.name}</TextBold>
            <VerticalSpacer $spacing={0.1} />
            <TextSubtle fontSize="0.8rem">{tx.description}</TextSubtle>
          </Column>
        </Expanded>
        <Column $horizontal="end">
          <CurrencyAmountSmall $positive={tx.amount > 0}>
            {tx.amount / 100} RGN
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
