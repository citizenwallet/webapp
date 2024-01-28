"use client";

import { Main } from "@/components/base";
import { ActionContainer, InfoContainer } from "./styles";

interface OnboardingLayoutProps {
  info?: React.ReactNode;
  action?: React.ReactNode;
}

const OnboardingLayout = ({ info, action }: OnboardingLayoutProps) => {
  return (
    <Main>
      {info && <InfoContainer>{info}</InfoContainer>}
      {action && <ActionContainer>{action}</ActionContainer>}
    </Main>
  );
};

export default OnboardingLayout;
