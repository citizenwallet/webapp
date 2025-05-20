// import { describe, it, expect } from "jest";
import { extractRelyingPartyId } from "../src/utils/webauthn";

describe("extractRelyingPartyId", () => {
  it("should extract hostname from a simple URL", () => {
    expect(extractRelyingPartyId("https://example.com")).toBe("example.com");
  });

  it("should extract full hostname from URL with subdomain", () => {
    expect(extractRelyingPartyId("https://login.example.com")).toBe(
      "login.example.com"
    );
    expect(extractRelyingPartyId("https://app.subdomain.example.com")).toBe(
      "app.subdomain.example.com"
    );
  });

  it("should handle URLs with ports", () => {
    expect(extractRelyingPartyId("https://example.com:443")).toBe(
      "example.com"
    );
    expect(extractRelyingPartyId("http://localhost:3000")).toBe("localhost");
  });

  it("should handle URLs with paths and query parameters", () => {
    expect(extractRelyingPartyId("https://example.com/path")).toBe(
      "example.com"
    );
    expect(
      extractRelyingPartyId("https://login.example.com/auth?redirect=home")
    ).toBe("login.example.com");
  });

  it("should handle special TLD domains", () => {
    expect(extractRelyingPartyId("https://example.co.uk")).toBe(
      "example.co.uk"
    );
    expect(extractRelyingPartyId("https://app.example.com.au")).toBe(
      "app.example.com.au"
    );
  });

  it("should handle localhost", () => {
    expect(extractRelyingPartyId("http://localhost")).toBe("localhost");
    expect(extractRelyingPartyId("https://localhost")).toBe("localhost");
  });

  it("should throw error for invalid URLs", () => {
    expect(() => extractRelyingPartyId("not-a-url")).toThrow(
      "Invalid origin URL"
    );
    expect(() => extractRelyingPartyId("http://")).toThrow(
      "Invalid origin URL"
    );
    expect(() => extractRelyingPartyId("")).toThrow("Invalid origin URL");
  });
});
