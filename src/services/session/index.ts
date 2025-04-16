import { id, keccak256, AbiCoder } from "ethers";

export const generateSessionSalt = (source: string, type: string) => {
  return id(`${source}:${type}`);
};

export const generateSessionRequestHash = (
  sessionProvider: string,
  sessionOwner: string,
  salt: string,
  expiry: number
) => {
  // Use ABI encoding to match the Dart implementation
  const abiCoder = new AbiCoder();
  const packedData = abiCoder.encode(
    ["address", "address", "bytes32", "uint48"],
    [sessionProvider, sessionOwner, salt, BigInt(expiry)]
  );

  const result = keccak256(packedData);
  return result;
};

export const generateSessionHash = (
  sessionRequestHash: string,
  challenge: number
) => {
  // Use ABI encoding to match the Dart implementation
  const abiCoder = new AbiCoder();
  const packedData = abiCoder.encode(
    ["bytes32", "uint256"],
    [sessionRequestHash, BigInt(challenge)]
  );

  return keccak256(packedData);
};
