"use client";

import { Main } from "@/components/base";
import {
  ActionBar,
  ActionBarSmall,
  ChildWrapper,
  HeaderWrapper,
} from "./styles";
import { useScrollPosition } from "@/hooks/page";

interface WalletLayoutProps {
  header?: React.ReactNode;
  actions?: React.ReactNode;
  smallActions?: React.ReactNode;
  children: React.ReactNode;
}

const WalletLayout = ({
  header,
  actions,
  smallActions,
  children,
}: WalletLayoutProps) => {
  const position = useScrollPosition();

  const showSmall = position > 100;

  return (
    <Main>
      {header && <HeaderWrapper>{header}</HeaderWrapper>}
      {actions && !showSmall && <ActionBar>{actions}</ActionBar>}
      {smallActions && showSmall && (
        <ActionBarSmall>{smallActions}</ActionBarSmall>
      )}
      {children && <ChildWrapper>{children}</ChildWrapper>}
    </Main>
  );
};

export default WalletLayout;
