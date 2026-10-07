/**
 * The listing kind a visitor picks first: for sale, for rent or student housing.
 *
 * Sale and rent are the server's `category` values. Student housing is filtered with
 * `isStudentFriendly=true`, the key the header and footer links already use: the upload form sets it for every
 * student listing (category "student"), and it also matches a rent listing its owner marked as suitable for
 * students. A URL never carries both keys.
 */
export type ListingKind = "all" | "sale" | "rent" | "student";

export const LISTING_KINDS: { value: ListingKind; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "sale", label: "للبيع" },
  { value: "rent", label: "للإيجار" },
  { value: "student", label: "سكن طلابي" },
];

/** URL keys owned by the listing-kind control. */
export const LISTING_KIND_KEYS = ["category", "isStudentFriendly"] as const;

export function listingKindParams(kind: ListingKind): Record<string, string> {
  if (kind === "sale" || kind === "rent") return { category: kind };
  if (kind === "student") return { isStudentFriendly: "true" };
  return {};
}

export function listingKindFromParams(params: { get(key: string): string | null }): ListingKind {
  if (params.get("isStudentFriendly") === "true") return "student";
  const category = params.get("category");
  if (category === "sale" || category === "rent") return category;
  if (category === "student") return "student";
  return "all";
}
