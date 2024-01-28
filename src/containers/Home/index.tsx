"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import CoverImage from "@/assets/images/cover.svg";
import { ImageContainer } from "./styles";
import { VerticalSpacer } from "@/components/base";
import { PrimaryButton } from "@/components/buttons";
import OnboardingLayout from "@/layouts/Onboarding";
import { Subtitle, Title } from "@/components/text";

interface HomeProps {}

export default function Home({}: HomeProps) {
  const router = useRouter();

  const handleStart = () => {
    router.push("/wallet");
  };

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
      action={<PrimaryButton onClick={handleStart}>Start</PrimaryButton>}
    />
  );
}
