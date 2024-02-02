"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import CoverImage from "@/assets/images/cover.svg";
import { ImageContainer } from "./styles";
import { VerticalSpacer } from "@/components/base";
import { PrimaryButton } from "@/components/buttons";
import OnboardingLayout from "@/layouts/Onboarding";
import { Subtitle, Title } from "@/components/text";

interface TransactionProps {}

export default function Transaction({}: TransactionProps) {
  const router = useRouter();

  const params = useSearchParams();

  const txid = params.get("txid");

  const handleStart = () => {
    router.replace("/wallet");
  };

  return (
    <OnboardingLayout
      info={
        <>
          <ImageContainer>
            <Image fill src={CoverImage} alt="Cover Image" />
          </ImageContainer>
          <Title>Citizen Wallet {txid}</Title>
          <VerticalSpacer $spacing={2} />
          <Subtitle>A wallet for your community.</Subtitle>
        </>
      }
      action={<PrimaryButton onClick={handleStart}>Start</PrimaryButton>}
    />
  );
}
