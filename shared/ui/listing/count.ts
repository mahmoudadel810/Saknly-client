import { formatNumber } from "@/shared/ui/Price";

/**
 * "إعلان واحد", "إعلانان", "5 إعلانات", "12 إعلانًا", "100 إعلان": the Arabic count agreement for a number
 * of listings, with Western digits.
 */
export function listingCount(n: number): string {
  if (n === 1) return "إعلان واحد";
  if (n === 2) return "إعلانان";
  const rest = n % 100;
  const word = rest >= 3 && rest <= 10 ? "إعلانات" : rest >= 11 && rest <= 99 ? "إعلانًا" : "إعلان";
  return `${formatNumber(n)} ${word}`;
}
