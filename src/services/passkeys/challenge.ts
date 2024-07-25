const { verifyAuthenticationResponse } = require("@simplewebauthn/server");
const base64url = require("base64url");

export const verifyAssertion = async (
  assertion: any,
  expectedChallenge: any,
  expectedOrigin: any,
  publicKey: any
) => {
  const verification = await verifyAuthenticationResponse({
    credential: {
      id: assertion.id,
      rawId: base64url.toBuffer(assertion.rawId),
      type: assertion.type,
      response: {
        authenticatorData: base64url.toBuffer(
          assertion.response.authenticatorData
        ),
        clientDataJSON: base64url.toBuffer(assertion.response.clientDataJSON),
        signature: base64url.toBuffer(assertion.response.signature),
        userHandle: assertion.response.userHandle
          ? base64url.toBuffer(assertion.response.userHandle)
          : null,
      },
    },
    expectedChallenge: base64url.encode(expectedChallenge),
    expectedOrigin: expectedOrigin,
    expectedRPID: "example.com", // replace with your Relying Party ID
    authenticator: {
      counter: 0, // replace with the stored counter value for the credential
      credentialPublicKey: base64url.toBuffer(publicKey),
    },
  });

  if (verification.verified) {
    console.log("Assertion verified successfully!");
  } else {
    console.log("Failed to verify assertion:", verification.error);
  }
};
