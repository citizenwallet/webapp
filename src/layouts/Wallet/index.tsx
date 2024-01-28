"use client";

import { Main } from "@/components/base";
import {
  ActionBar,
  ChildWrapper,
  ContentWrapper,
  HeaderWrapper,
} from "./styles";

interface WalletLayoutProps {
  header?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const WalletLayout = ({ header, actions, children }: WalletLayoutProps) => {
  return (
    <Main>
      <ContentWrapper>
        {header && <HeaderWrapper>{header}</HeaderWrapper>}
        {actions && <ActionBar>{actions}</ActionBar>}
        {children && <ChildWrapper>{children}</ChildWrapper>}
      </ContentWrapper>
    </Main>
  );
};

export default WalletLayout;
