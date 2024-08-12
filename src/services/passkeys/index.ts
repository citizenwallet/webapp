export class PasskeyService {
  static async createPasskey(displayName?: string) {
    const passkeyCredential = await navigator.credentials.create({
      publicKey: {
        pubKeyCredParams: [
          {
            alg: -7,
            type: "public-key",
          },
        ],
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: {
          name: "Safe SmartAccount",
        },
        user: {
          displayName: displayName || "User",
          id: crypto.getRandomValues(new Uint8Array(32)),
          name: displayName || "User",
        },
        timeout: 60_000,
        attestation: "none",
      },
    });

    if (!passkeyCredential) {
      throw Error("Passkey creation failed: No credential was returned.");
    }
    console.log("passkeyCredential: ", passkeyCredential);

    return passkeyCredential;
  }

  static async signMessage(rawId?: string) {
    try {
      const options: PublicKeyCredentialRequestOptions = {
        challenge: window.crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: rawId
          ? [
              {
                id: Uint8Array.from(atob(rawId), (c) => c.charCodeAt(0)),
                type: "public-key",
              },
            ]
          : [],
        userVerification: "preferred",
      };

      let credential = (await navigator.credentials.get({
        publicKey: options,
      })) as PublicKeyCredential;

      const response = credential.response as AuthenticatorAssertionResponse;
      return response.signature;
    } catch (error) {
      console.error(
        "------------Message signing successful------------",
        error
      );
    }
  }
}
