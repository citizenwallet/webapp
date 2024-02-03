/**
 * Returns a BigInt of the amount passed as a string by the user
 * @param amount string amount (e.g. "1245", "1245.00", "1245.50", "1245.5", "1.123456")
 * @param decimals e.g. 6 for USDC, 18 for ETH, ...
 * @returns BigInt of the amount multiplied by 10 to the power of decimals, null if invalid amount (checks for 0, 1 or more decimals after the dot)
 */
export const getBigIntAmountFromString = function(amount: string, tokenDecimals: number) {

  if (!amount.match(/[0-9]+(\.[0-9][0-9]?)?/)) {
    console.log("Invalid amount", amount);
    return null;
  }

  if (amount.indexOf(".") === -1) {
    amount += ".00";
  }
  const decimals = amount.split(".")[1].length;

  if (decimals > tokenDecimals) {
    console.log("Invalid amount: too many decimals", amount);
    return null;
  }

  const amountInCents = amount.replace(".", "");
  return parseInt(amountInCents, 10) * 10 ** (tokenDecimals - decimals);
}

export function formatBigIntAmount(amount: bigint, locale: string, tokenDecimals: number) {
  const numberFormatter = new Intl.NumberFormat(locale || "en", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const amountInCents: string = (BigInt(amount) * BigInt(100) / BigInt(10) ** BigInt(tokenDecimals)).toString();
  console.log(">>> amountInCents", amountInCents);
  const formattedAmount = numberFormatter.format(parseInt(amountInCents, 10) / 100);
  console.log(">>> formattedAmount", formattedAmount);
  return formattedAmount;
}