"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { formatNumber } from "@/shared/ui/Price";
import { governorateOf } from "@/shared/constants/property";
import {
  LISTING_KIND_KEYS,
  listingKindFromParams,
  listingKindParams,
  type ListingKind,
} from "./listingKind";

/*
 * The browse filters' state and its URL sync. The URL is the source of truth: the state is read from it on
 * load and again whenever the URL changes from outside (a header link, back/forward, the page's own
 * pagination), and every change is written back with router.replace (router.push for the listing kind, which
 * is a navigation-sized choice). Typed values (search, prices, areas, down payment) reach the URL only after
 * a 400ms pause, the price slider on release. Any change drops `page`. The page's fetch keys off the URL, so
 * it aborts a superseded request itself.
 */

// URL keys this hook owns; every other key (page, limit, ...) is preserved.
export const OWNED_KEYS = [
  ...LISTING_KIND_KEYS,
  "sort",
  "search",
  "price[gte]",
  "price[lte]",
  "location.governorate",
  "location.city",
  "type",
  "bedrooms",
  "bathrooms",
  // `area` (an exact match) is no longer written; it stays here so an old link's value is cleaned up.
  "area",
  "area[gte]",
  "area[lte]",
  "amenities",
  // `downPayment` (an exact match) likewise; the filter is now "down payment up to".
  "downPayment",
  "downPayment[lte]",
  "installmentPeriodInYears",
] as const;

const DEBOUNCE_MS = 400;

export const yearsLabel = (n: number) => (n === 1 ? "سنة واحدة" : n === 2 ? "سنتان" : n <= 10 ? `${n} سنوات` : `${n} سنة`);

export const SORT_OPTIONS = [
  { value: "-createdAt", label: "الأحدث" },
  { value: "price", label: "السعر: من الأقل" },
  { value: "-price", label: "السعر: من الأعلى" },
  { value: "-views", label: "الأكثر مشاهدة" },
] as const;
export const DEFAULT_SORT = "-createdAt";

/** Slider bounds per listing kind. They are UI bounds, not data: at a bound the price is not filtered. */
export const PRICE_BOUNDS: Record<ListingKind, { min: number; max: number; step: number }> = {
  all: { min: 0, max: 100_000_000, step: 100_000 },
  sale: { min: 0, max: 100_000_000, step: 100_000 },
  rent: { min: 0, max: 200_000, step: 1_000 },
  student: { min: 0, max: 15_000, step: 100 },
};

type Params = { get(key: string): string | null; has(key: string): boolean };

const list = (params: Params, key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
const numberOrNull = (params: Params, key: string) => {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};
const text = (params: Params, key: string) => params.get(key) ?? "";

export interface FilterValues {
  kind: ListingKind;
  sort: string;
  search: string;
  priceMin: string;
  priceMax: string;
  governorates: string[];
  cities: string[];
  types: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  areaMin: string;
  areaMax: string;
  amenities: string[];
  downPaymentMax: string;
  installmentYears: number | null;
}

function readValues(params: Params): FilterValues {
  return {
    kind: listingKindFromParams(params),
    // "" means the server default (newest first); an explicit value is kept as written.
    sort: params.get("sort") ?? "",
    search: text(params, "search"),
    priceMin: text(params, "price[gte]"),
    priceMax: text(params, "price[lte]"),
    governorates: list(params, "location.governorate"),
    cities: list(params, "location.city"),
    types: list(params, "type"),
    bedrooms: numberOrNull(params, "bedrooms"),
    bathrooms: numberOrNull(params, "bathrooms"),
    areaMin: text(params, "area[gte]") || text(params, "area"),
    areaMax: text(params, "area[lte]") || text(params, "area"),
    amenities: list(params, "amenities"),
    downPaymentMax: text(params, "downPayment[lte]") || text(params, "downPayment"),
    installmentYears: numberOrNull(params, "installmentPeriodInYears"),
  };
}

const positive = (value: string) => {
  const n = Number(value);
  return value.trim() !== "" && Number.isFinite(n) && n > 0 ? String(n) : null;
};

/** The URL keys for a set of values (owned keys only). */
function writeValues(values: FilterValues): URLSearchParams {
  const out = new URLSearchParams(listingKindParams(values.kind));
  const set = (key: string, value: string | null | undefined) => {
    if (value) out.set(key, value);
  };
  set("sort", values.sort);
  set("search", values.search.trim().slice(0, 100));
  set("price[gte]", positive(values.priceMin));
  set("price[lte]", positive(values.priceMax));
  if (values.governorates.length) set("location.governorate", values.governorates.join(","));
  if (values.cities.length) set("location.city", values.cities.join(","));
  if (values.types.length) set("type", values.types.join(","));
  if (values.bedrooms !== null) set("bedrooms", String(values.bedrooms));
  if (values.bathrooms !== null) set("bathrooms", String(values.bathrooms));
  set("area[gte]", positive(values.areaMin));
  set("area[lte]", positive(values.areaMax));
  if (values.amenities.length) set("amenities", values.amenities.join(","));
  set("downPayment[lte]", positive(values.downPaymentMax));
  if (values.installmentYears !== null) set("installmentPeriodInYears", String(values.installmentYears));
  return out;
}

/** Drops the cities that are outside the chosen governorates (no governorate chosen keeps them all). */
const citiesWithin = (cities: string[], governorates: string[]) =>
  governorates.length ? cities.filter((city) => governorates.includes(governorateOf(city) ?? "")) : cities;

const ownedState = (params: URLSearchParams) => OWNED_KEYS.map((key) => `${key}=${params.get(key) ?? ""}`).join("&");

/** Keys whose typed value waits for a pause before it reaches the URL. */
type TypedKey = "search" | "priceMin" | "priceMax" | "areaMin" | "areaMax" | "downPaymentMax";

export interface FilterChip {
  key: string;
  label: string;
  onDelete: () => void;
}

export function usePropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  // `draft` follows the inputs live; `applied` is what reaches the URL.
  const [draft, setDraft] = useState<FilterValues>(() => readValues(searchParams));
  const [applied, setApplied] = useState<FilterValues>(draft);
  // Queries this hook wrote recently. Navigation is async, so the URL can pass through an older write of
  // ours after a newer one; only a query we did not write counts as an outside change.
  const written = useRef<string[]>([searchKey]);
  const kindChanged = useRef(false);

  const applyTyped = useDebouncedCallback((next: FilterValues) => setApplied(next), DEBOUNCE_MS);

  // The URL changed from outside: take its values.
  useEffect(() => {
    if (written.current.includes(searchKey)) return;
    written.current = [searchKey];
    applyTyped.cancel();
    const values = readValues(new URLSearchParams(searchKey));
    setDraft(values);
    setApplied(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  // Write the applied values to the URL when they differ from it.
  useEffect(() => {
    const current = new URLSearchParams(window.location.search);
    const next = new URLSearchParams(current);
    OWNED_KEYS.forEach((key) => next.delete(key));
    writeValues(applied).forEach((value, key) => next.set(key, value));
    if (ownedState(current) === ownedState(next)) {
      kindChanged.current = false;
      return;
    }
    // A filter change invalidates the current page number.
    next.delete("page");
    const query = next.toString();
    written.current = [...written.current.slice(-9), query];
    const href = query ? `${pathname}?${query}` : pathname;
    if (kindChanged.current) router.push(href, { scroll: false });
    else router.replace(href, { scroll: false });
    kindChanged.current = false;
  }, [applied, pathname, router]);

  /** A change that applies at once (checkboxes, selects, toggles, the slider on release). */
  const update = useCallback(
    (patch: Partial<FilterValues>) => {
      applyTyped.cancel();
      const next = { ...draft, ...patch };
      setDraft(next);
      setApplied(next);
    },
    [applyTyped, draft],
  );

  /** A typed change: shown at once, applied after a pause. */
  const type = useCallback(
    (key: TypedKey, value: string) => {
      const next = { ...draft, [key]: value };
      setDraft(next);
      applyTyped(next);
    },
    [applyTyped, draft],
  );

  /** Shows a value without applying it (the price slider while it is dragged). */
  const preview = useCallback((patch: Partial<FilterValues>) => setDraft((prev) => ({ ...prev, ...patch })), []);

  const setKind = useCallback(
    (kind: ListingKind) => {
      kindChanged.current = true;
      // Price bounds differ per kind (a sale price means nothing as a monthly rent), so the price resets, and
      // payment-plan filters apply to sale listings only.
      const patch: Partial<FilterValues> = { kind, priceMin: "", priceMax: "" };
      if (kind === "rent" || kind === "student") {
        patch.downPaymentMax = "";
        patch.installmentYears = null;
      }
      update(patch);
    },
    [update],
  );

  const toggleIn = useCallback(
    (key: "governorates" | "cities" | "types" | "amenities", value: string) => {
      const current = draft[key];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (key === "governorates") update({ governorates: next, cities: citiesWithin(draft.cities, next) });
      else update({ [key]: next });
    },
    [draft, update],
  );

  const clearAll = useCallback(() => {
    update({
      search: "",
      priceMin: "",
      priceMax: "",
      governorates: [],
      cities: [],
      types: [],
      bedrooms: null,
      bathrooms: null,
      areaMin: "",
      areaMax: "",
      amenities: [],
      downPaymentMax: "",
      installmentYears: null,
    });
  }, [update]);

  const chips = useMemo<FilterChip[]>(() => {
    const out: FilterChip[] = [];
    const a = applied;
    if (a.search.trim()) out.push({ key: "search", label: `«${a.search.trim()}»`, onDelete: () => update({ search: "" }) });
    const pMin = positive(a.priceMin);
    const pMax = positive(a.priceMax);
    if (pMin || pMax) {
      const label = pMin && pMax
        ? `السعر ${formatNumber(+pMin)}–${formatNumber(+pMax)} ج.م`
        : pMin
          ? `السعر من ${formatNumber(+pMin)} ج.م`
          : `السعر حتى ${formatNumber(+pMax!)} ج.م`;
      out.push({ key: "price", label, onDelete: () => update({ priceMin: "", priceMax: "" }) });
    }
    a.governorates.forEach((g) =>
      out.push({
        key: `governorate-${g}`,
        label: `محافظة ${g}`,
        onDelete: () => {
          const governorates = a.governorates.filter((x) => x !== g);
          update({ governorates, cities: citiesWithin(a.cities, governorates) });
        },
      }),
    );
    a.cities.forEach((city) =>
      out.push({ key: `city-${city}`, label: city, onDelete: () => update({ cities: a.cities.filter((c) => c !== city) }) }),
    );
    a.types.forEach((t) =>
      out.push({ key: `type-${t}`, label: t, onDelete: () => update({ types: a.types.filter((x) => x !== t) }) }),
    );
    if (a.bedrooms !== null) out.push({ key: "bedrooms", label: `الغرف: ${a.bedrooms}`, onDelete: () => update({ bedrooms: null }) });
    if (a.bathrooms !== null) out.push({ key: "bathrooms", label: `الحمامات: ${a.bathrooms}`, onDelete: () => update({ bathrooms: null }) });
    const aMin = positive(a.areaMin);
    const aMax = positive(a.areaMax);
    if (aMin || aMax) {
      const label = aMin && aMax ? (aMin === aMax ? `${aMin} م²` : `${aMin}–${aMax} م²`) : aMin ? `من ${aMin} م²` : `حتى ${aMax} م²`;
      out.push({ key: "area", label, onDelete: () => update({ areaMin: "", areaMax: "" }) });
    }
    a.amenities.forEach((m) =>
      out.push({ key: `amenity-${m}`, label: m, onDelete: () => update({ amenities: a.amenities.filter((x) => x !== m) }) }),
    );
    const dp = positive(a.downPaymentMax);
    if (dp) out.push({ key: "downPayment", label: `مقدم حتى ${formatNumber(+dp)} ج.م`, onDelete: () => update({ downPaymentMax: "" }) });
    if (a.installmentYears !== null)
      out.push({ key: "installment", label: `التقسيط: ${yearsLabel(a.installmentYears)}`, onDelete: () => update({ installmentYears: null }) });
    return out;
  }, [applied, update]);

  const setSort = useCallback((sort: string) => update({ sort: sort === DEFAULT_SORT ? "" : sort }), [update]);

  return {
    draft,
    applied,
    update,
    type,
    preview,
    setKind,
    setSort,
    toggleIn,
    clearAll,
    chips,
    bounds: PRICE_BOUNDS[draft.kind],
  };
}

export type PropertyFilters = ReturnType<typeof usePropertyFilters>;
