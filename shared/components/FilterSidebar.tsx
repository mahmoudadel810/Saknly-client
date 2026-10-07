"use client";

import React, { useId } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { AMENITIES, CITY_OPTIONS, PROPERTY_TYPE_OPTIONS } from "@/shared/constants/property";
import { formatNumber } from "@/shared/ui/Price";
import { yearsLabel, type PropertyFilters } from "@/shared/ui/listing/usePropertyFilters";

const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const YEARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** A labelled group of filters: a fieldset whose legend is the visible section title. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      component="fieldset"
      sx={{ m: 0, p: 0, border: 0, minWidth: 0, py: 2.5, borderTop: 1, borderColor: "divider", "&:first-of-type": { borderTop: 0, pt: 0 } }}
    >
      <Typography component="legend" variant="subtitle2" sx={{ p: 0, mb: 1.5, fontSize: "0.875rem", fontWeight: 600 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function CheckList({
  options,
  selected,
  onToggle,
  columns = 1,
}: {
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: columns === 2 ? "repeat(2, minmax(0, 1fr))" : "1fr", columnGap: 1 }}>
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          sx={{ m: 0, minHeight: 36, "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
          control={
            <Checkbox
              size="small"
              checked={selected.includes(option.value)}
              onChange={() => onToggle(option.value)}
              sx={{ p: 0.75, marginInlineEnd: 0.5 }}
            />
          }
          label={option.label}
        />
      ))}
    </Box>
  );
}

const numberInput = { inputMode: "numeric" as const, min: 0 };

/**
 * The browse filters as a form. It holds no state: everything comes from usePropertyFilters, so the
 * desktop column and the mobile drawer show the same values and the applied-filter chips stay in step.
 */
export default function FilterSidebar({ filters }: { filters: PropertyFilters }) {
  const id = useId();
  const { draft, type, update, preview, toggleIn, bounds } = filters;
  const showPaymentPlan = draft.kind === "all" || draft.kind === "sale";

  const sliderValue = [
    Math.min(Number(draft.priceMin) || bounds.min, bounds.max),
    Math.min(Number(draft.priceMax) || bounds.max, bounds.max),
  ];
  const fromSlider = (value: number[]) => ({
    priceMin: value[0] > bounds.min ? String(value[0]) : "",
    priceMax: value[1] < bounds.max ? String(value[1]) : "",
  });

  return (
    <Box>
      <Section title="كلمة البحث">
        <TextField
          fullWidth
          type="search"
          value={draft.search}
          onChange={(event) => type("search", event.target.value)}
          placeholder="العنوان، الحي، أو وصف العقار"
          slotProps={{
            htmlInput: { maxLength: 100, "aria-label": "كلمة البحث" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined aria-hidden />
                </InputAdornment>
              ),
            },
          }}
        />
      </Section>

      <Section title={draft.kind === "rent" || draft.kind === "student" ? "الإيجار الشهري (ج.م)" : "السعر (ج.م)"}>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="من"
            type="number"
            value={draft.priceMin}
            onChange={(event) => type("priceMin", event.target.value)}
            slotProps={{ htmlInput: { ...numberInput, step: bounds.step } }}
          />
          <TextField
            label="إلى"
            type="number"
            value={draft.priceMax}
            onChange={(event) => type("priceMax", event.target.value)}
            slotProps={{ htmlInput: { ...numberInput, step: bounds.step } }}
          />
        </div>
        <Box sx={{ px: 1.25, pt: 1.5 }}>
          <Slider
            value={sliderValue}
            min={bounds.min}
            max={bounds.max}
            step={bounds.step}
            onChange={(_, value) => preview(fromSlider(value as number[]))}
            onChangeCommitted={(_, value) => update(fromSlider(value as number[]))}
            getAriaLabel={(index) => (index === 0 ? "أقل سعر" : "أعلى سعر")}
            getAriaValueText={(value) => `${formatNumber(value)} ج.م`}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatNumber(value)}
            disableSwap
          />
        </Box>
      </Section>

      <Section title="المدينة">
        <CheckList
          options={CITY_OPTIONS.map((city) => ({ value: city, label: city }))}
          selected={draft.cities}
          onToggle={(value) => toggleIn("cities", value)}
          columns={2}
        />
      </Section>

      <Section title="نوع العقار">
        <CheckList
          options={PROPERTY_TYPE_OPTIONS}
          selected={draft.types}
          onToggle={(value) => toggleIn("types", value)}
          columns={2}
        />
      </Section>

      <Section title="الغرف والحمامات">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            select
            label="الغرف"
            value={draft.bedrooms === null ? "" : String(draft.bedrooms)}
            onChange={(event) => update({ bedrooms: event.target.value ? Number(event.target.value) : null })}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="">أي عدد</MenuItem>
            {COUNTS.map((n) => (
              <MenuItem key={n} value={String(n)}>
                {n}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="الحمامات"
            value={draft.bathrooms === null ? "" : String(draft.bathrooms)}
            onChange={(event) => update({ bathrooms: event.target.value ? Number(event.target.value) : null })}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="">أي عدد</MenuItem>
            {COUNTS.map((n) => (
              <MenuItem key={n} value={String(n)}>
                {n}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </Section>

      <Section title="المساحة (م²)">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="من"
            type="number"
            value={draft.areaMin}
            onChange={(event) => type("areaMin", event.target.value)}
            slotProps={{ htmlInput: numberInput }}
          />
          <TextField
            label="إلى"
            type="number"
            value={draft.areaMax}
            onChange={(event) => type("areaMax", event.target.value)}
            slotProps={{ htmlInput: numberInput }}
          />
        </div>
      </Section>

      <Section title="المرافق">
        <CheckList
          options={AMENITIES.map((amenity) => ({ value: amenity, label: amenity }))}
          selected={draft.amenities}
          onToggle={(value) => toggleIn("amenities", value)}
        />
      </Section>

      {showPaymentPlan && (
        <Section title="التقسيط">
          <div className="grid gap-3">
            <TextField
              id={`${id}-down`}
              label="المقدم حتى (ج.م)"
              type="number"
              value={draft.downPaymentMax}
              onChange={(event) => type("downPaymentMax", event.target.value)}
              slotProps={{ htmlInput: numberInput }}
            />
            <TextField
              select
              label="مدة التقسيط"
              value={draft.installmentYears === null ? "" : String(draft.installmentYears)}
              onChange={(event) => update({ installmentYears: event.target.value ? Number(event.target.value) : null })}
              slotProps={{ select: { displayEmpty: true } }}
            >
              <MenuItem value="">أي مدة</MenuItem>
              {YEARS.map((n) => (
                <MenuItem key={n} value={String(n)}>
                  {yearsLabel(n)}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </Section>
      )}
    </Box>
  );
}
