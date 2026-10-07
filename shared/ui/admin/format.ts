/**
 * Admin date formatting: Arabic month names with Western digits (DESIGN-SYSTEM.md, Typography), the same
 * on the server and in every browser.
 */
const DATE = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "short", year: "numeric" });
const DATE_TIME = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const parse = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "7 أكتوبر 2026", or a dash when the date is missing or invalid. */
export const formatDate = (value: string | Date | null | undefined): string => {
  const date = parse(value);
  return date ? DATE.format(date) : "—";
};

/** "7 أكتوبر 2026، 14:30". */
export const formatDateTime = (value: string | Date | null | undefined): string => {
  const date = parse(value);
  return date ? DATE_TIME.format(date) : "—";
};

/** Sort key for date columns. */
export const dateValue = (value: string | null | undefined): number | null => parse(value)?.getTime() ?? null;

/** Western digits with thousands separators. */
export const formatCount = (value: number): string => new Intl.NumberFormat("en-US").format(value);

/**
 * An Arabic counted noun: forms for 1, 2, 3–10 and 11+ ("إعلان واحد", "إعلانين", "3 إعلانات", "12 إعلانًا").
 * `few` and `many` receive the formatted number.
 */
export const countNoun = (
  n: number,
  forms: { one: string; two: string; few: (n: string) => string; many: (n: string) => string },
): string => {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  const mod100 = n % 100;
  return mod100 >= 3 && mod100 <= 10 ? forms.few(formatCount(n)) : forms.many(formatCount(n));
};

/** "إعلان واحد" … in the genitive/accusative (after a verb noun such as اعتماد). */
export const listingsCount = (n: number) =>
  countNoun(n, {
    one: "إعلان واحد",
    two: "إعلانين",
    few: (x) => `${x} إعلانات`,
    many: (x) => `${x} إعلانًا`,
  });

/** "عقار واحد", "عقارين", "3 عقارات", "12 عقارًا". */
export const propertiesCount = (n: number) =>
  countNoun(n, {
    one: "عقار واحد",
    two: "عقارين",
    few: (x) => `${x} عقارات`,
    many: (x) => `${x} عقارًا`,
  });
