"use client";

import { Main } from "@/components/base";
import { ActionContainer, ContentWrapper, InfoContainer } from "./styles";

interface OnboardingLayoutProps {
  info?: React.ReactNode;
  action?: React.ReactNode;
}

const OnboardingLayout = ({ info, action }: OnboardingLayoutProps) => {
  return (
    <Main>
      <ContentWrapper>
        {info && <InfoContainer>{info}</InfoContainer>}
        {action && <ActionContainer>{action}</ActionContainer>}
      </ContentWrapper>
    </Main>
  );
};

export default OnboardingLayout;
