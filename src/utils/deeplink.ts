import { gzipSync } from "fflate";

export function compress(data: string) {
  const encodedData = Buffer.from(data, "utf8");
  const gzippedData = gzipSync(encodedData, { level: 6 });
  const base64Data = Buffer.from(gzippedData.buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return base64Data;
}

export const generateReceiveDeepLink = (
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
