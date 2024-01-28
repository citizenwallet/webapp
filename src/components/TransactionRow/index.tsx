import { Transaction } from "@/state/transactions/state";
import { Column, Expanded, Row, VerticalSpacer } from "../base";
import { SubtleSubtitle, TextBold } from "../text";
import RoundedImage from "../RoundedImage";
import UserIcon from "@/assets/icons/user.svg";

interface TransactionRowProps {
  tx: Transaction;
}

export default function TransactionRow({ tx }: TransactionRowProps) {
  return (
    <Row key={tx.id}>
      <RoundedImage src={UserIcon} size={42} />
      <Column>
        <TextBold>{tx.name}</TextBold>
        <VerticalSpacer $spacing={0.5} />
        <SubtleSubtitle>{tx.description}</SubtleSubtitle>
      </Column>
      <Expanded />
      <Column>
        <TextBold>{tx.amount} RGN</TextBold>
        <VerticalSpacer $spacing={0.5} />
        <SubtleSubtitle>{tx.status}</SubtleSubtitle>
      </Column>
    </Row>
  );
}
