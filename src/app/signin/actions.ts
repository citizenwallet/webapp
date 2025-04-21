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
