export function getFriendlyIntString(
  num: number | undefined,
  digits = 0
): string {
  if (num === 0) return "0";
  if (!num) return "-1";
  return num.toLocaleString(undefined, {
    maximumFractionDigits: digits,
  });
}
export function getFriendlyIntStringRate(
  num: number | undefined,
  digits = 4
): string {
  if (num === 0) return "0";
  if (!num) return "-1";
  return num.toLocaleString(undefined, {
    maximumFractionDigits: digits,
  });
}
