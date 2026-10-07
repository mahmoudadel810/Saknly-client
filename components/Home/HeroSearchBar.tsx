"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { GOVERNORATES, citiesFor } from "@/shared/constants/property";
import { LISTING_KINDS, listingKindParams, type ListingKind } from "@/shared/ui/listing/listingKind";

/*
 * One segment of the combined bar (DESIGN-SYSTEM.md v2, "Inputs"): a small label above a borderless value, on
 * the bar's field colour. The segment, not the input, shows hover and focus, so the bar reads as one control.
 * From md up the segments sit in a row split by 1px dividers; below md they stack with dividers between them.
 */
const segmentSx = {
  position: "relative",
  minWidth: 0,
  px: 2,
  py: 1,
  borderRadius: "12px",
  transition: "background-color 150ms ease-out, box-shadow 150ms ease-out",
  "&:hover": { bgcolor: "color-mix(in srgb, var(--c-text) 4%, transparent)" },
  "&:focus-within": { bgcolor: "background.paper", boxShadow: "0 0 0 2px var(--c-primary)" },
  "& .MuiInputLabel-root": {
    mb: 0,
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1.5,
    color: "text.secondary",
    "&.Mui-disabled": { color: "text.secondary" },
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 0,
    bgcolor: "transparent",
    boxShadow: "none",
    "&.Mui-focused": { bgcolor: "transparent", boxShadow: "none" },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "&.Mui-disabled": { opacity: 1 },
  },
  "& .MuiOutlinedInput-input": {
    paddingBlock: "2px",
    paddingInline: 0,
    fontSize: "0.9375rem",
    fontWeight: 500,
    "&.Mui-disabled": { WebkitTextFillColor: "var(--c-muted)" },
  },
  "& .MuiSelect-select": { paddingInlineEnd: "28px !important" },
  "& .MuiSelect-icon": { insetInlineEnd: 0 },
} as const;

const dividerSx = {
  // Between segments: a short vertical rule from md up, a full-width line when stacked.
  "&:not(:first-of-type)::before": {
    content: '""',
    position: "absolute",
    bgcolor: "divider",
    insetInlineStart: { xs: 16, md: -1 },
    insetInlineEnd: { xs: 16, md: "auto" },
    top: { xs: -1, md: 14 },
    bottom: { xs: "auto", md: 14 },
    width: { xs: "auto", md: "1px" },
    height: { xs: "1px", md: "auto" },
  },
  "&:focus-within::before, &:hover::before, &:focus-within + &::before, &:hover + &::before": { opacity: 0 },
} as const;

/**
 * The home search: a white floating panel with the listing kind as tabs on top, then one combined bar —
 * governorate | city | free-text query | "بحث". It opens /properties with the same URL keys the browse filters
 * read (category / isStudentFriendly, location.governorate, location.city, search), so the result page shows
 * the chosen filters as chips. The city list follows the chosen governorate.
 */
export default function HeroSearchBar() {
  const router = useRouter();
  const [kind, setKind] = useState<ListingKind>("all");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(listingKindParams(kind));
    if (governorate) params.set("location.governorate", governorate);
    if (city) params.set("location.city", city);
    const q = query.trim();
    if (q) params.set("search", q);
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : "/properties");
  };

  return (
    <Box
      component="form"
      role="search"
      aria-label="البحث عن عقار"
      onSubmit={handleSubmit}
      sx={{
        bgcolor: "background.paper",
        borderRadius: "var(--r-card)",
        boxShadow: "0 2px 6px rgba(10, 20, 20, 0.08), 0 24px 48px rgba(10, 20, 20, 0.18)",
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <ToggleButtonGroup
        exclusive
        value={kind}
        onChange={(_, next: ListingKind | null) => next && setKind(next)}
        aria-label="نوع الإعلان"
        sx={{
          display: "flex",
          gap: 0.5,
          mb: 1.5,
          overflowX: "auto",
          "& .MuiToggleButtonGroup-grouped": {
            flex: { xs: 1, sm: "0 0 auto" },
            minHeight: 40,
            px: 2,
            border: 0,
            borderRadius: "10px !important",
            whiteSpace: "nowrap",
            fontSize: "0.9375rem",
            color: "text.secondary",
            "&:hover": { bgcolor: "color-mix(in srgb, var(--c-text) 5%, transparent)" },
            "&.Mui-selected": {
              color: "primary.main",
              bgcolor: "var(--c-primary-soft)",
              "&:hover": { bgcolor: "var(--c-primary-soft)" },
            },
          },
        }}
      >
        {LISTING_KINDS.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(0, 0.9fr) minmax(0, 0.9fr) minmax(0, 1.6fr) auto",
          },
          alignItems: "center",
          gap: { xs: 0, md: 0.5 },
          p: 0.75,
          borderRadius: "14px",
          bgcolor: "var(--c-field)",
        }}
      >
        <Box sx={{ ...segmentSx, ...dividerSx }}>
          <TextField
            select
            fullWidth
            label="المحافظة"
            value={governorate}
            onChange={(event) => {
              setGovernorate(event.target.value);
              setCity("");
            }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="">كل المحافظات</MenuItem>
            {GOVERNORATES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ ...segmentSx, ...dividerSx }}>
          <TextField
            select
            fullWidth
            label="المدينة"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            disabled={!governorate}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="">{governorate ? "كل المدن" : "اختر المحافظة أولًا"}</MenuItem>
            {(governorate ? citiesFor([governorate]) : []).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ ...segmentSx, ...dividerSx }}>
          <TextField
            fullWidth
            label="كلمة البحث"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="مثال: شقة قريبة من الجامعة"
            slotProps={{ htmlInput: { maxLength: 100, enterKeyHint: "search" } }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<SearchOutlined aria-hidden />}
          sx={{ minHeight: 48, px: 3.5, mt: { xs: 1, md: 0 }, marginInlineStart: { md: 0.5 } }}
        >
          بحث
        </Button>
      </Box>
    </Box>
  );
}
