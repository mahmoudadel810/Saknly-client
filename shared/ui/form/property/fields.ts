import type { ChangeEvent } from "react";
import { toDigits, type PropertyFormValues } from "@/shared/utils/propertyFormValidation";

/** What every section of the publish-listing form receives. */
export interface SectionProps {
  values: PropertyFormValues;
  errors: Record<string, string>;
  /** `name` is a field of PropertyFormValues or "contactInfo.<field>". */
  setField: (name: string, value: unknown) => void;
}

/** The DOM id of a field, used for labels and to focus the first invalid field. */
export const fieldId = (name: string) => `pf-${name.replace(/\./g, "-")}`;

/** The element to focus for a field: a select's combobox, else the input. */
export function focusField(name: string) {
  const el = document.getElementById(`mui-component-select-${name}`) ?? document.getElementById(fieldId(name));
  if (!el) return;
  el.scrollIntoView({ block: "center" });
  el.focus({ preventScroll: true });
}

function readValue(values: PropertyFormValues, name: string): string {
  if (name.startsWith("contactInfo.")) {
    return values.contactInfo[name.slice("contactInfo.".length) as keyof PropertyFormValues["contactInfo"]];
  }
  const value = values[name as keyof PropertyFormValues];
  return typeof value === "string" ? value : "";
}

/**
 * The common props of a text field or select bound to the form: id, name, value, onChange and the error flag.
 * `digits` keeps Western digits only (Arabic-Indic digits typed on Arabic keyboards are converted).
 */
export function bind(p: SectionProps, name: string, options: { digits?: boolean } = {}) {
  return {
    id: fieldId(name),
    name,
    value: readValue(p.values, name),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      p.setField(name, options.digits ? toDigits(e.target.value) : e.target.value),
    error: Boolean(p.errors[name]),
    fullWidth: true,
  };
}

/** Helper text: the error when there is one, otherwise the hint. */
export const help = (p: SectionProps, name: string, hint?: string) => p.errors[name] ?? hint;

/** Numeric inputs: a numeric keyboard on phones, digits read left to right. */
export const numericInput = { htmlInput: { inputMode: "numeric" as const, dir: "ltr" } };

export const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
