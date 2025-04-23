"use server";

import {
  GenerateRegistrationOptionsOpts,
  generateRegistrationOptions,
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
  verifyRegistrationResponse,
  VerifiedRegistrationResponse,
  GenerateAuthenticationOptionsOpts,
  generateAuthenticationOptions,
  PublicKeyCredentialRequestOptionsJSON,
  verifyAuthenticationResponse,
  WebAuthnCredential,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import {
  Config,
  CommunityConfig,
  verifyConnectedUrl,
} from "@citizenwallet/sdk";
import { getBytes, Wallet } from "ethers";
import {
  generateSessionRequestHash,
  generateSessionSalt,
generateSessionHash
} from "@/services/session/index";

const relyingPartyName = process.env.RELYING_PARTY_NAME;
const relyingPartyId = process.env.RELYING_PARTY_ID;
const relyingPartyOrigin = process.env.RELYING_PARTY_ORIGIN;

export async function generatePasskeyRegistrationOptionsAction(args: {
  existingPasskeys: WebAuthnCredential[];
}): Promise<PublicKeyCredentialCreationOptionsJSON> {
  if (!relyingPartyName) {
    throw new Error(
      "The 'RELYING_PARTY_NAME' environment variable is missing. Please define it."
    );
  }
  if (!relyingPartyId) {
    throw new Error(
      "The 'RELYING_PARTY_ID' environment variable is missing. Please define it."
    );
  }
  const { existingPasskeys } = args;

  const excludeCredentials =
    existingPasskeys.length > 0
      ? existingPasskeys.map((p) => ({
          id: p.id,
          transports: p.transports,
        }))
      : undefined;

  const options: GenerateRegistrationOptionsOpts = {
    rpName: relyingPartyName,
    rpID: relyingPartyId,
    userName: relyingPartyName,
    supportedAlgorithmIDs: [-7, -257],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      requireResidentKey: true,
      residentKey: "required",
      userVerification: "preferred",
    },
    excludeCredentials,
    extensions: {
      credProps: true,
    },
  };

  try {
    const registrationOptions = await generateRegistrationOptions(options);
    return registrationOptions;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function verifyPasskeyRegistrationAction(args: {
  registrationOptions: PublicKeyCredentialCreationOptionsJSON;
  resgistrationResponse: RegistrationResponseJSON;
}): Promise<VerifiedRegistrationResponse> {
  const { registrationOptions, resgistrationResponse } = args;

  try {
    if (!relyingPartyId) {
      throw new Error(
        "The 'RELYING_PARTY_ID' environment variable is missing. Please define it."
      );
    }
    if (!relyingPartyOrigin) {
      throw new Error(
        "The 'RELYING_PARTY_ORIGIN' environment variable is missing. Please define it."
      );
    }

    const verification = await verifyRegistrationResponse({
      response: resgistrationResponse,
      expectedChallenge: registrationOptions.challenge,
      expectedOrigin: relyingPartyOrigin,
      expectedRPID: relyingPartyId,
      requireUserVerification: false,
    });

    return verification;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generatePasskeyAuthenticationOptionsAction(args: {
  passkeys: WebAuthnCredential[];
}): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const { passkeys } = args;

  if (!relyingPartyName) {
    throw new Error(
      "The 'RELYING_PARTY_NAME' environment variable is missing. Please define it."
    );
  }
  if (!relyingPartyId) {
    throw new Error(
      "The 'RELYING_PARTY_ID' environment variable is missing. Please define it."
    );
  }

  const options: GenerateAuthenticationOptionsOpts = {
    rpID: relyingPartyId,
    allowCredentials: passkeys.map((p) => ({
      id: p.id,
      transports: p.transports,
    })),
  };

  try {
    const authenticationOptions = await generateAuthenticationOptions(options);
    return authenticationOptions;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function verifyPasskeyAuthenticationAction(args: {
  authenticationOptions: PublicKeyCredentialRequestOptionsJSON;
  authenticationResponse: AuthenticationResponseJSON;
  selectedCredential: WebAuthnCredential;
}) {
  const { authenticationOptions, authenticationResponse, selectedCredential } =
    args;

  try {
    if (!relyingPartyId) {
      throw new Error(
        "The 'RELYING_PARTY_ID' environment variable is missing. Please define it."
      );
    }
    if (!relyingPartyOrigin) {
      throw new Error(
        "The 'RELYING_PARTY_ORIGIN' environment variable is missing. Please define it."
      );
    }

    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge: authenticationOptions.challenge,
      expectedOrigin: relyingPartyOrigin,
      expectedRPID: relyingPartyId,
      credential: selectedCredential,
      requireUserVerification: false,
    });

    return verification;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function requestSessionAction({
  credential,
  config,
}: {
  config: Config;
  credential: WebAuthnCredential;
}) {
  const communityConfig = new CommunityConfig(config);
  const provider = communityConfig.primarySessionConfig.provider_address;

  const signer = Wallet.createRandom();
  const sessionOwner = signer.address;

  const SECONDS_PER_DAY = 60 * 60 * 24;
  const DAYS = 365;
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + SECONDS_PER_DAY * DAYS;

  const publicKeyBuffer = credential.publicKey;
  const publicKey = publicKeyBuffer.toString();

  const salt = generateSessionSalt(publicKey, "passkey");
  const hash = generateSessionRequestHash(provider, sessionOwner, salt, expiry);
  const hashInBytes = getBytes(hash);
  const signature = await signer.signMessage(hashInBytes);

  const requestBody = {
    provider,
    owner: sessionOwner,
    source: publicKey,
    type: "passkey",
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
    sessionRequestChallengeHash: string;
    sessionRequestChallengeExpiry: number;
    status: number;
  } = await response.json();

  return {
    sessionRequestTxHash: responseBody.sessionRequestTxHash,
    hash,
    privateKey: signer.privateKey,
    challengeHash: responseBody.sessionRequestChallengeHash,
    challengeExpiry: responseBody.sessionRequestChallengeExpiry,
  };
}

export async function confirmSessionAction({
  privateKey,
  sessionRequestHash,
  sessionChallengeHash,
  sessionChallengeExpiry,
  config,
}: {
  privateKey: string;
  sessionRequestHash: string;
  sessionChallengeHash: string;
  sessionChallengeExpiry: number;
  config: Config;
}) {
  const communityConfig = new CommunityConfig(config);
  const provider = communityConfig.primarySessionConfig.provider_address;

  const signer = new Wallet(privateKey);
  const sessionOwner = signer.address;
  const challengeSig = await signer.signMessage(sessionChallengeHash);

  const params = new URLSearchParams();
  params.set("sigAuthAccount", sessionOwner); // the account address
  params.set("sigAuthExpiry", sessionChallengeExpiry.toString()); // expiry timestamp
  params.set("sigAuthSignature", challengeSig); // the signature

  const result = await verifyConnectedUrl(communityConfig, { params });

  if (!result) {
    throw new Error("Cannot verify signer");
  }

  const sessionHash = generateSessionHash(
    sessionRequestHash,
    sessionChallengeHash,
  );

  const sessionHashInBytes = getBytes(sessionHash);
  const signature = await signer.signMessage(sessionHashInBytes);

  const requestBody = {
    provider: provider,
    owner: sessionOwner,
    sessionRequestHash: sessionRequestHash,
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
