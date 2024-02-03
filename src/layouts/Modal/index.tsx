"use client";

import { Main } from "@/components/base";
import { useScrollPosition } from "@/hooks/page";

interface ModalLayoutProps {
  header?: React.ReactNode;
  actions?: React.ReactNode;
  smallActions?: React.ReactNode;
  children: React.ReactNode;
}

const ModalLayout = ({
  header,
  actions,
  smallActions,
  children,
}: ModalLayoutProps) => {
  const position = useScrollPosition();

  const showSmall = position > 100;

  return (
    <Main>
      {children}
    </Main>
  );
};

export default ModalLayout;
