"use client";

import { Main } from "@/components/base";
import {
  ActionBar,
  ActionBarSmall,
  ChildWrapper,
  HeaderWrapper,
} from "./styles";

interface AccountLayoutProps {
  header?: React.ReactNode;
  actions?: React.ReactNode;
  smallActions?: React.ReactNode;
  children: React.ReactNode;
}

const AccountLayout = ({
  header,
  actions,
  smallActions,
  children,
}: AccountLayoutProps) => {

  return (
    <Main>
      {header && <HeaderWrapper>{header}</HeaderWrapper>}
      {children && <ChildWrapper>{children}</ChildWrapper>}
    </Main>
  );
};

export default AccountLayout;
