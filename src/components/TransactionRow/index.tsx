import { Transaction } from "@/state/transactions/state";
import {
  Column,
  Expanded,
  HorizontalSpacer,
  Row,
  VerticalSpacer,
} from "../base";
import { TextSubtle, TextBold } from "../text";
import RoundedImage from "../RoundedImage";
import UserIcon from "@/assets/icons/user.svg";

interface TransactionRowProps {
  tx: Transaction;
}

export default function TransactionRow({ tx }: TransactionRowProps) {
  return (
    <Column $fill key={tx.id}>
      <VerticalSpacer $spacing={0.5} />
      <Row>
        <HorizontalSpacer $spacing={0.5} />
        <RoundedImage src={UserIcon} size={42} />
        <HorizontalSpacer $spacing={0.5} />
        <Column $horizontal="start">
          <TextBold>{tx.name}</TextBold>
          <VerticalSpacer $spacing={0.1} />
          <TextSubtle>{tx.description}</TextSubtle>
        </Column>
        <Expanded />
        <Column $horizontal="end">
          <TextBold>{tx.amount} RGN</TextBold>
          <VerticalSpacer $spacing={0.1} />
          <TextSubtle>{tx.status}</TextSubtle>
        </Column>
        <HorizontalSpacer $spacing={0.5} />
      </Row>
      <VerticalSpacer $spacing={0.5} />
    </Column>
  );
}
