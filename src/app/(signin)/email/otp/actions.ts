"use server";

import { z } from "zod";
import { otpFormSchema } from "@/app/(signin)/email/otp/_components/otp-form-schema";
import { CommunityConfig, Config } from "@citizenwallet/sdk";
import { getBytes, Wallet } from "ethers";
import { generateSessionHash } from "@/services/session";

export async function submitOtpFormAction({
  formData,
  config,
}: {
  formData: z.infer<typeof otpFormSchema>;
  config: Config;
}) {
  const formDataParseResult = otpFormSchema.safeParse(formData);
  if (!formDataParseResult.success) {
    console.error(formDataParseResult.error);
    throw new Error("Invalid form data");
  }

  const communityConfig = new CommunityConfig(config);
  const provider = communityConfig.primarySessionConfig.provider_address;

  const signer = new Wallet(formData.privateKey);
  const sessionOwner = signer.address;

  const sessionHash = generateSessionHash(
    formData.sessionRequestHash,
    parseInt(formData.code),
  );

  const sessionHashInBytes = getBytes(sessionHash);
  const signature = await signer.signMessage(sessionHashInBytes);

  const requestBody = {
    provider: provider,
    owner: sessionOwner,
    sessionRequestHash: formData.sessionRequestHash,
    sessionHash: sessionHash,
    signedSessionHash: signature,
  };

  const alias = config.community.alias;
  const url = `${process.env.NEXT_PUBLIC_CW_SESSION_API_BASE_URL}/app/${alias}/session`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseBody: {
    sessionConfirmTxHash: string;
    status: number;
  } = await response.json();

  return {
    sessionRequestTxHash: responseBody.sessionConfirmTxHash,
  };
}
