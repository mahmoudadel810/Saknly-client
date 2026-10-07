import type { PropertyFormValues } from "@/shared/utils/propertyFormValidation";

const DRAFT_KEY = "saknly:property-draft";

/** Everything but the photos: File objects cannot be stored, so they must be added again. */
export type PropertyDraft = Omit<PropertyFormValues, "images">;

/** Keeps the text fields when the session expires mid-form, so they survive the trip to /login. */
export function saveDraft(values: PropertyFormValues): boolean {
  try {
    const { images: _images, ...rest } = values;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), values: rest }));
    return true;
  } catch {
    return false;
  }
}

/** Reads and removes the saved draft (one restore per save). */
export function takeDraft(): PropertyDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(DRAFT_KEY);
    const parsed = JSON.parse(raw) as { values?: PropertyDraft };
    return parsed?.values && typeof parsed.values === "object" ? parsed.values : null;
  } catch {
    return null;
  }
}
