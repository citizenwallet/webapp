"use server";

import { emailFormSchema } from "@/app/signin/email/_components/email-form-schema";
import { z } from "zod";
import { Wallet, getBytes } from "ethers";
import {
  generateSessionRequestHash,
  generateSessionSalt,
} from "@/services/session/index";
import { Config, CommunityConfig } from "@citizenwallet/sdk";

export async function submitEmailFormAction({
  formData,
  config,
}: {
  formData: z.infer<typeof emailFormSchema>;
  config: Config;
}) {
  // Validate form data
  const formDataParseResult = emailFormSchema.safeParse(formData);
  if (!formDataParseResult.success) {
    console.error(formDataParseResult.error);
    throw new Error("Invalid form data");
  }

  // Initialize configuration
  const communityConfig = new CommunityConfig(config);
  const provider = communityConfig.primarySessionConfig.provider_address;

  // Generate session parameters
  const signer = Wallet.createRandom();
  const sessionOwner = signer.address;

  // Calculate expiry time
  const SECONDS_PER_DAY = 60 * 60 * 24;
  const DAYS = 365;
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + SECONDS_PER_DAY * DAYS;

  // Generate session credentials
  const salt = generateSessionSalt(formData.email, formData.type);
  const hash = generateSessionRequestHash(provider, sessionOwner, salt, expiry);
  const hashInBytes = getBytes(hash);
  const signature = await signer.signMessage(hashInBytes);

  // Prepare request payload
  const requestBody = {
    provider,
    owner: sessionOwner,
    source: formData.email,
    type: formData.type,
    expiry,
    signature,
  };

  const alias = config.community.alias;
  const url = `${process.env.NEXT_PUBLIC_CW_SESSION_API_BASE_URL}/app/${alias}/session`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseBody: {
    sessionRequestTxHash: string;
    status: number;
  } = await response.json();

  return {
    sessionRequestTxHash: responseBody.sessionRequestTxHash,
    hash,
    privateKey: signer.privateKey,
  };
}
