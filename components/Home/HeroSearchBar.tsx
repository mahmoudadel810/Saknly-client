"use client";

import React, { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { CITY_OPTIONS } from "@/shared/constants/property";
import { LISTING_KINDS, listingKindParams, type ListingKind } from "@/shared/ui/listing/listingKind";

const FIELD_HEIGHT = 48;

// One 48px row: the theme gives fields 44px, the hero asks for a little more presence.
const fieldSx = {
  "& .MuiOutlinedInput-root": { minHeight: FIELD_HEIGHT },
  "& .MuiOutlinedInput-input": { paddingBlock: "13px" },
} as const;

/**
 * The home search: listing kind, city and a free-text query, then "بحث". It opens /properties with the same
 * URL keys the browse filters read (category / isStudentFriendly, location.city, search), so the result page
 * shows the chosen filters as chips.
 */
export default function HeroSearchBar() {
  const router = useRouter();
  const id = useId();
  const [kind, setKind] = useState<ListingKind>("all");
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(listingKindParams(kind));
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
        border: 1,
        borderColor: "divider",
        borderRadius: "10px",
        bgcolor: "background.paper",
        p: { xs: 2, md: 2.5 },
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,200px)_minmax(0,1fr)_auto] lg:items-end">
        <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <FormLabel id={`${id}-kind`} sx={{ mb: "6px", lineHeight: 1.5 }}>
            نوع الإعلان
          </FormLabel>
          <ToggleButtonGroup
            exclusive
            value={kind}
            onChange={(_, next: ListingKind | null) => next && setKind(next)}
            aria-labelledby={`${id}-kind`}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${LISTING_KINDS.length}, minmax(0, 1fr))`,
              "& .MuiToggleButton-root": {
                height: FIELD_HEIGHT,
                px: 2,
                whiteSpace: "nowrap",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "text.secondary",
                borderColor: "var(--c-border-strong, var(--c-border))",
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
        </Box>

        <TextField
          select
          label="المدينة"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          sx={fieldSx}
          slotProps={{ select: { displayEmpty: true } }}
        >
          <MenuItem value="">كل المدن</MenuItem>
          {CITY_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="كلمة البحث"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="مثال: شقة قريبة من الجامعة"
          sx={fieldSx}
          slotProps={{
            htmlInput: { maxLength: 100, enterKeyHint: "search" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined aria-hidden />
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<SearchOutlined aria-hidden />}
          sx={{ height: FIELD_HEIGHT, px: 4, fontSize: "0.9375rem" }}
        >
          بحث
        </Button>
      </div>
    </Box>
  );
}
