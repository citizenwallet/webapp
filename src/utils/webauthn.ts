export function extractRelyingPartyId(origin: string): string {
  try {
    // Create a URL object to parse the origin
    const url = new URL(origin);

    // Get and return the full hostname (removes protocol and port)
    return url.hostname;
  } catch (error) {
    throw new Error("Invalid origin URL");
  }
}
