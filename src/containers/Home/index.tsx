"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import CoverImage from "@/assets/images/cover.svg";
import { ImageContainer } from "./styles";
import { VerticalSpacer } from "@/components/base";
import { PrimaryButton } from "@/components/buttons";
import OnboardingLayout from "@/layouts/Onboarding";
import { Subtitle, Title } from "@/components/text";
import { useBootLogic } from "@/state/boot/logic";
import { useEffect } from "react";
import { ConfigType } from "@/types/config";

interface HomeProps {
  config: ConfigType
}

export default function Home({ config }: HomeProps) {
  const router = useRouter();

  const logic = useBootLogic(config);

  useEffect(() => {
    async function init() {
      const accountAddress = await logic.createOrRestore();
      if (!accountAddress) return;
      router.replace('/account?address=' + accountAddress);
    }
    init();
  }, [logic, router]);

  return (
    <OnboardingLayout
      info={
        <>
          <ImageContainer>
            <Image fill src={CoverImage} alt="Cover Image" />
          </ImageContainer>
          <Title>Citizen Wallet</Title>
          <VerticalSpacer $spacing={2} />
          <Subtitle>A wallet for your community.</Subtitle>
        </>
      }
    />
  );
}
