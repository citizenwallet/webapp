import { gzipSync, gunzipSync } from "fflate";

export function compress(data: string) {
  const encodedData = Buffer.from(data, "utf8");
  const gzippedData = gzipSync(encodedData, { level: 6 });
  const base64Data = Buffer.from(gzippedData.buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return base64Data;
}

export function decompress(data: string) {
  const base64Data = data.replace(/-/g, "+").replace(/_/g, "/");
  const gzippedData = Buffer.from(base64Data, "base64");
  const decompressedData = Buffer.from(gunzipSync(gzippedData).buffer).toString(
    "utf8"
  );
  return decompressedData;
}

export const generateReceiveLink = (
  baseUrl: string,
  account: string,
  alias: string,
  amount?: string,
  description?: string
) => {
  let receiveParams = `?address=${account}&alias=${alias}`;
  if (account) {
    receiveParams += `&amount=${amount}`;
  }

  if (description) {
    receiveParams += `&message=${description}`;
  }

  const compressedParams = compress(receiveParams);

  return `${baseUrl}/#/?alias=${alias}&receiveParams=${compressedParams}`;
};

// export const parseReceiveDeepLink = (deepLink: string) => {
//   const url = new URL(deepLink.replace("#/", ""));
//   console.log("url", url);
//   const alias = url.searchParams.get("alias");
//   console.log("alias", alias);
//   const receiveParams = url.searchParams.get("receiveParams");
//   console.log("receiveParams", receiveParams);
//   if (!alias || !receiveParams) {
//     return null;
//   }

//   const decompressedParams = decompress(receiveParams);
//   console.log("decompressedParams", decompressedParams);
//   const params = new URLSearchParams(decompressedParams);
//   console.log("params", params);

//   return {
//     alias,
//     account: params.get("address"),
//     amount: params.get("amount"),
//     description: params.get("message"),
//   };
// };

// enum that represents the different qr code formats
export enum QRFormat {
  address,
  voucher,
  eip681,
  eip681Transfer,
  receiveUrl,
  unsupported,
}

export function parseQRFormat(raw: string): QRFormat {
  if (raw.startsWith("ethereum:") && !raw.includes("/")) {
    return QRFormat.eip681;
  } else if (raw.startsWith("ethereum:") && raw.includes("/transfer")) {
    return QRFormat.eip681Transfer;
  } else if (raw.startsWith("0x")) {
    return QRFormat.address;
  } else if (raw.includes("receiveParams=")) {
    return QRFormat.receiveUrl;
  } else if (raw.includes("voucher=")) {
    return QRFormat.voucher;
  } else {
    return QRFormat.unsupported;
  }
}

function parseEIP681(raw: string): [string, string | null] {
  const url = new URL(raw);

  let address = url.pathname.split("/")[1];
  if (address.includes("@")) {
    // includes chain id, remove
    address = address.split("@")[0];
  }

  const value = url.searchParams.get("value");

  return [address, value];
}

function parseEIP681Transfer(raw: string): [string, string | null] {
  const url = new URL(raw);

  const address = url.searchParams.get("address");
  const value = url.searchParams.get("uint256");

  return [address || "", value];
}

function parseReceiveLink(raw: string): [string, string | null] {
  const receiveUrl = new URL(raw.replace("#/", ""));

  const encodedParams = receiveUrl.searchParams.get("receiveParams");
  if (encodedParams === null) {
    return ["", null];
  }

  const decodedParams = decompress(encodedParams); // You need to implement decompress function

  const params = new URLSearchParams(decodedParams);

  const address = params.get("address");
  const amount = params.get("amount");

  return [address || "", amount];
}

export function parseQRCode(raw: string): [string, string | null] {
  const format = parseQRFormat(raw);

  switch (format) {
    case QRFormat.address:
      return [raw, null];
    case QRFormat.eip681:
      return parseEIP681(raw);
    case QRFormat.eip681Transfer:
      return parseEIP681Transfer(raw);
    case QRFormat.receiveUrl:
      return parseReceiveLink(raw);
    case QRFormat.voucher:
    // vouchers are invalid for a transfer
    default:
      return ["", null];
  }
}

export function parseAliasFromReceiveLink(raw: string): string | null {
  console.log('raw.replace("#/", "")', raw.replace("#/", ""));
  const receiveUrl = new URL(raw.replace("#/", ""));

  const encodedParams = receiveUrl.searchParams.get("receiveParams");
  if (encodedParams === null) {
    return null;
  }

  const decodedParams = decompress(encodedParams); // You need to implement decompress function
  console.log("decodedParams", decodedParams);
  const params = new URLSearchParams(decodedParams);

  const alias = params.get("alias");

  return alias;
}

export function parseMessageFromReceiveLink(raw: string): string | null {
  const receiveUrl = new URL(raw.replace("#/", ""));

  const encodedParams = receiveUrl.searchParams.get("receiveParams");
  if (encodedParams === null) {
    return null;
  }

  const decodedParams = decompress(encodedParams); // You need to implement decompress function

  const params = new URLSearchParams(decodedParams);

  const message = params.get("message");

  return message;
}
