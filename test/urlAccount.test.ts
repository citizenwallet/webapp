import { parsePrivateKeyFromHash } from "../src/services/account/urlAccount";
import dotenv from "dotenv";
dotenv.config();

jest.mock("ethers", () => ({
  Wallet: {
    fromEncryptedJson: jest.fn(),
  },
}));

describe("parsePrivateKeyFromHash", () => {
  it("should return account and wallet when valid input is provided", async () => {
    const baseUrl = "http://localhost";
    const hash =
      "#/wallet/v3-MHhiMTEyQUQ4ZmQxMjcwNEZhRDU4ZTFCMWFmYTk0OTY1QjM5MjE3YTQ0fHsiYWRkcmVzcyI6ImJlOWZhOTVmMzM0NDgxMTAxNDgxODgwNmUxYWUyNzI3ZmYzMDcwYWQiLCJpZCI6ImI3MmRlNmI3LWQ0YWUtNGRlOS1hYWNjLTBkNjgyZDQ5YjQ3NyIsInZlcnNpb24iOjMsIkNyeXB0byI6eyJjaXBoZXIiOiJhZXMtMTI4LWN0ciIsImNpcGhlcnBhcmFtcyI6eyJpdiI6ImEzNGRiN2VhODkyNGQ3YzljMDM3ZWEwMGQzY2E3MDA3In0sImNpcGhlcnRleHQiOiIzNWY5MDM4YWFmNzE1ZWIzNzk0ZTMwYTBlNDAwMTJjZjMyMjFkNWJhYjRiODU3MTVmZmRkZjgyZTZmMDczZDIyIiwia2RmIjoic2NyeXB0Iiwia2RmcGFyYW1zIjp7InNhbHQiOiIyYmM0YTM1MjNiNTg5YTg3ZjUxNWI2NGI5YzY0NzZlYjFjNzhhZjI5NTBhNmE5ZjBkOGUzNmI2MzRkNmI1YmYwIiwibiI6MTMxMDcyLCJka2xlbiI6MzIsInAiOjEsInIiOjh9LCJtYWMiOiIwZjViYzZlZGI1NTFiZjNjYzhkMzYwNjg0MjE2YzU5MzA3N2FmYmRlNWY1MDk4MWIwZDRjODc5Nzk4ZDI5YmQ4In0sIngtZXRoZXJzIjp7ImNsaWVudCI6ImV0aGVycy82LjEzLjAiLCJnZXRoRmlsZW5hbWUiOiJVVEMtLTIwMjQtMDYtMTdUMDktMzUtMjEuMFotLWJlOWZhOTVmMzM0NDgxMTAxNDgxODgwNmUxYWUyNzI3ZmYzMDcwYWQiLCJwYXRoIjoibS80NCcvNjAnLzAnLzAvMCIsImxvY2FsZSI6ImVuIiwibW5lbW9uaWNDb3VudGVyIjoiZTZlYmRlMDc4ZGMxNTY1MWNlZmI3ZGQyZjEyZWMzNDUiLCJtbmVtb25pY0NpcGhlcnRleHQiOiJkNzRlNzVkMjM4MjY5NjE2MGRiNzRhNDJlN2FhNGFjOCIsInZlcnNpb24iOiIwLjEifX0=?alias=gratitude";
    const walletPassword = process.env.NEXT_PUBLIC_WEB_BURNER_PASSWORD;
    if (!walletPassword) {
      throw new Error("Wallet password not set");
    }

    const expectedAccount = "0xb112AD8fd12704FaD58e1B1afa94965B39217a44";

    const [account, wallet] = await parsePrivateKeyFromHash(
      baseUrl,
      hash,
      walletPassword
    );

    expect(account).toBe(expectedAccount);
    expect(wallet).toBeDefined();
  });

  it("should return account and wallet from the dart v3 wallet", async () => {
    const baseUrl = "http://localhost";
    const hash =
      "#/wallet/v3-MHhlMDM1ZDRlZmI2YjIxMWFmODZkMTc0NjM1ZTNlZTFiMTdhY2QyMDM2fHsiY3J5cHRvIjp7ImNpcGhlciI6ImFlcy0xMjgtY3RyIiwiY2lwaGVycGFyYW1zIjp7Iml2IjoiZjE1YWZkMDg5MmJjMTNmNDJiOGI1ZmUzNzMxYTdjYzUifSwiY2lwaGVydGV4dCI6IjhhZDczZTcwYzQ0ODE5ZTk0ZjM5MDk2YTllNjg5YmVhYjY1MDc4N2RjNTkzZWVlOWY5NTQ0ZTM3YTNjN2YzZWY5YSIsImtkZiI6InNjcnlwdCIsImtkZnBhcmFtcyI6eyJka2xlbiI6MzIsIm4iOjUxMiwiciI6OCwicCI6MSwic2FsdCI6Ijc3Y2VlOWZjNDJkZGY2N2YwNjFkZWFkNzFhZDkzYTVmZGU4MTA0NTMzZWQzMDdjZjNhN2RjMzM2MDNiYjc5ZTcifSwibWFjIjoiNTUwNmFjZDE3ODk1ZGQzMzY2ZTVhNTU3NGVmYWI2NjgxMGEyZmJjZmM2MjY5MzA4Njk4MWQwMTkxZWIyMjgyZCJ9LCJpZCI6IjA5NDdkNzk1LTcxYjYtNDg4YS1hZTkxLWNmMzg2YzBjYzkzYyIsInZlcnNpb24iOjN9?alias=gratitude";
    const walletPassword = process.env.NEXT_PUBLIC_WEB_BURNER_PASSWORD;
    if (!walletPassword) {
      throw new Error("Wallet password not set");
    }

    const expectedAccount = "0xe035d4efb6b211af86d174635e3ee1b17acd2036";

    const [account, wallet] = await parsePrivateKeyFromHash(
      baseUrl,
      hash,
      walletPassword
    );

    expect(account).toBe(expectedAccount);
    expect(wallet).toBeDefined();
  });

  it("should return undefined when invalid input is provided", async () => {
    const baseUrl = "http://localhost";
    const hash = "#/invalid";
    const walletPassword = "password";

    const [account, wallet] = await parsePrivateKeyFromHash(
      baseUrl,
      hash,
      walletPassword
    );

    expect(account).toBeUndefined();
    expect(wallet).toBeUndefined();
  });
});
