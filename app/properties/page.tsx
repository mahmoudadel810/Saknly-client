"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import MapOutlined from "@mui/icons-material/MapOutlined";
import SearchOffOutlined from "@mui/icons-material/SearchOffOutlined";
import SwapVertOutlined from "@mui/icons-material/SwapVertOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import FilterSidebar from "@/shared/components/FilterSidebar";
import { api } from "@/shared/services/api";
import PageBanner from "@/shared/ui/PageBanner";
import PropertyCard, { toPropertyCardData, type ListingLike } from "@/shared/ui/PropertyCard";
import LoadingState from "@/shared/ui/LoadingState";
import ErrorState from "@/shared/ui/ErrorState";
import EmptyState from "@/shared/ui/EmptyState";
import { listingCount } from "@/shared/ui/listing/count";
import { LISTING_KINDS, type ListingKind } from "@/shared/ui/listing/listingKind";
import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  usePropertyFilters,
  type PropertyFilters,
} from "@/shared/ui/listing/usePropertyFilters";
import type { MapListing } from "@/shared/components/PropertyMap";

// Leaflet is client-only and heavy; it loads when the visitor opens the map view.
const PropertyMap = dynamic(() => import("@/shared/components/PropertyMap"), {
  ssr: false,
  loading: () => <LoadingState compact label="جاري تحميل الخريطة" />,
});

// Divisible by the 1, 2, 3 and 4 card columns, so full rows.
const PAGE_SIZE = 12;

const TITLES: Record<ListingKind, string> = {
  all: "كل العقارات",
  sale: "عقارات للبيع",
  rent: "عقارات للإيجار",
  student: "سكن طلابي",
};

type Listing = ListingLike & MapListing & { _id: string };

function FiltersPanelHeader({ filters, onClose }: { filters: PropertyFilters; onClose?: () => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 2 }}>
      <Typography component="h2" variant="h5">
        الفلاتر
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {filters.chips.length > 0 && (
          <Button size="small" onClick={filters.clearAll}>
            مسح الكل
          </Button>
        )}
        {onClose && (
          <IconButton onClick={onClose} aria-label="إغلاق الفلاتر">
            <CloseOutlined />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = usePropertyFilters();
  const { applied, chips } = filters;

  const [properties, setProperties] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  // A string key: the searchParams object identity changes on every navigation.
  const searchKey = searchParams.toString();

  const fetchProperties = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(searchKey);
        params.set("page", params.get("page") || "1");
        params.set("limit", params.get("limit") || String(PAGE_SIZE));
        params.set("isApproved", "true");

        const response = await api.get(`/properties/allProperties?${params.toString()}`, { signal });
        if (signal.aborted) return;

        if (response.data?.success) {
          setProperties(Array.isArray(response.data.data) ? response.data.data : []);
          setTotal(Number(response.data.pagination?.totalDocs) || 0);
          // The server's page count follows the limit it applied (a `limit` in the URL, capped at 50).
          setTotalPages(Number(response.data.pagination?.totalPages) || 0);
        } else {
          setError("تعذر تحميل العقارات");
        }
      } catch (err) {
        // A newer filter state superseded this request; its result must not overwrite the newer one.
        if (axios.isCancel(err)) return;
        setError("تعذر تحميل العقارات");
      }
      if (!signal.aborted) setLoading(false);
    },
    [searchKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProperties(controller.signal);
    return () => controller.abort();
  }, [fetchProperties, reloadKey]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    const next = new URLSearchParams(searchKey);
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    const query = next.toString();
    router.push(query ? `/properties?${query}` : "/properties", { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const countText = loading ? "جاري البحث…" : error ? "" : total === 0 ? "لا توجد نتائج" : listingCount(total);

  let results: React.ReactNode;
  if (loading) {
    results = <LoadingState variant="cards" columns={3} count={6} label="جاري تحميل العقارات" />;
  } else if (error) {
    results = <ErrorState title={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  } else if (properties.length === 0) {
    results = chips.length > 0 ? (
      <EmptyState
        icon={<SearchOffOutlined />}
        title="لا توجد عقارات تطابق هذه الفلاتر"
        description="جرب إزالة بعض الفلاتر أو توسيع نطاق السعر."
        action={
          <Button variant="outlined" onClick={filters.clearAll}>
            مسح كل الفلاتر
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={<SearchOffOutlined />}
        title="لا توجد إعلانات منشورة في هذا القسم بعد"
        description="جرب قسمًا آخر، أو عد لاحقًا."
        action={
          <Button component={Link} href="/" variant="outlined">
            الصفحة الرئيسية
          </Button>
        }
      />
    );
  } else if (view === "map") {
    results = <PropertyMap properties={properties} />;
  } else {
    results = (
      // Three cards per row at most (next to the 280px filter column from lg). MUI breakpoints, so the columns
      // change at the same widths as the filter column and the drawer button.
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        {properties.map((property, index) => (
          <PropertyCard key={property._id} property={toPropertyCardData(property)} priority={index < 3} />
        ))}
      </Box>
    );
  }

  return (
    <main id="main">
      <PageBanner
        variant="photo"
        overlap
        breadcrumbs={[{ label: "الرئيسية", href: "/" }, { label: TITLES[applied.kind] }]}
        title={TITLES[applied.kind]}
        description={
          <Box component="span" role="status" aria-live="polite">
            {countText}
          </Box>
        }
      />
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, pb: { xs: 4, md: 6 } }}>
        {/*
         * Toolbar on a white panel floating over the banner's bottom edge (as the home search panel does):
         * listing kind, then filters (below lg), sort and view.
         */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mt: -6,
            mb: 2.5,
            p: 1.5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
            border: 1,
            borderColor: "divider",
            borderRadius: "var(--r-card)",
            bgcolor: "background.paper",
            boxShadow: "var(--c-card-shadow-hover)",
          }}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filters.draft.kind}
            onChange={(_, next: ListingKind | null) => next && filters.setKind(next)}
            aria-label="نوع الإعلان"
            sx={{
              flex: { xs: "1 1 100%", sm: "0 0 auto" },
              display: "grid",
              gridTemplateColumns: `repeat(${LISTING_KINDS.length}, minmax(0, 1fr))`,
              gap: 0.5,
              p: 0.5,
              borderRadius: "var(--r-inner)",
              bgcolor: "var(--c-field)",
              "& .MuiToggleButton-root": {
                height: 40,
                px: 2,
                border: 0,
                borderRadius: "10px !important",
                whiteSpace: "nowrap",
                fontWeight: 600,
                color: "text.secondary",
                "&:hover": { bgcolor: "color-mix(in srgb, var(--c-primary) 6%, transparent)" },
                "&.Mui-selected": {
                  color: "primary.main",
                  bgcolor: "background.paper",
                  boxShadow: "0 1px 3px rgba(16, 24, 22, 0.12)",
                  "&:hover": { bgcolor: "background.paper" },
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

          <Box sx={{ flex: 1, display: { xs: "none", sm: "block" } }} />

          <Badge
            badgeContent={chips.length}
            color="primary"
            overlap="rectangular"
            sx={{ display: { lg: "none" } }}
          >
            <Button
              variant="outlined"
              startIcon={<TuneOutlined aria-hidden />}
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              sx={{ minHeight: 48 }}
            >
              الفلاتر
            </Button>
          </Badge>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: { xs: 1, sm: "0 0 auto" }, minWidth: 0 }}>
            {/* Hidden on phones to leave the select room; aria-labelledby still reads it. */}
            <Typography
              id="sort-label"
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap", display: { xs: "none", sm: "inline" } }}
            >
              الترتيب
            </Typography>
            <TextField
              select
              value={applied.sort || DEFAULT_SORT}
              onChange={(event) => filters.setSort(event.target.value)}
              sx={{ minWidth: 0, width: { xs: "100%", sm: 184 } }}
              slotProps={{
                select: { SelectDisplayProps: { "aria-labelledby": "sort-label" } },
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ display: { xs: "none", sm: "flex" } }}>
                      <SwapVertOutlined aria-hidden />
                    </InputAdornment>
                  ),
                },
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={view}
            onChange={(_, next: "grid" | "map" | null) => next && setView(next)}
            aria-label="طريقة العرض"
            sx={{
              gap: 0.5,
              p: 0.5,
              borderRadius: "var(--r-inner)",
              bgcolor: "var(--c-field)",
              "& .MuiToggleButton-root": {
                height: 40,
                width: 44,
                border: 0,
                borderRadius: "10px !important",
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                  bgcolor: "background.paper",
                  boxShadow: "0 1px 3px rgba(16, 24, 22, 0.12)",
                  "&:hover": { bgcolor: "background.paper" },
                },
              },
            }}
          >
            <ToggleButton value="grid" aria-label="عرض البطاقات">
              <GridViewOutlined fontSize="small" />
            </ToggleButton>
            <ToggleButton value="map" aria-label="عرض الخريطة">
              <MapOutlined fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {chips.length > 0 && (
          <Box
            component="ul"
            aria-label="الفلاتر المطبقة"
            sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, listStyle: "none", m: 0, p: 0, mb: 2.5 }}
          >
            {chips.map((chip) => (
              <li key={chip.key}>
                <Chip
                  label={chip.label}
                  onDelete={chip.onDelete}
                  variant="outlined"
                  deleteIcon={<CloseOutlined aria-label={`إزالة ${chip.label}`} />}
                  sx={{ maxWidth: 260, bgcolor: "background.paper" }}
                />
              </li>
            ))}
            <li>
              <Button size="small" onClick={filters.clearAll}>
                مسح الكل
              </Button>
            </li>
          </Box>
        )}

        <Box
          sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "280px minmax(0, 1fr)" } }}
        >
          <Box
            component="aside"
            aria-label="فلاتر البحث"
            sx={{
              display: { xs: "none", lg: "block" },
              alignSelf: "start",
              position: "sticky",
              top: 80,
              maxHeight: "calc(100vh - 96px)",
              overflowY: "auto",
              p: 2.5,
              border: 1,
              borderColor: "divider",
              borderRadius: "var(--r-card)",
              bgcolor: "background.paper",
              boxShadow: "var(--c-card-shadow)",
            }}
          >
            <FiltersPanelHeader filters={filters} />
            <FilterSidebar filters={filters} />
          </Box>

          <Box component="section" aria-label="النتائج" sx={{ minWidth: 0 }}>
            {results}
            {!loading && !error && totalPages > 1 && (
              <Box component="nav" aria-label="صفحات النتائج" sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={Math.min(currentPage, totalPages)}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  size="large"
                  siblingCount={1}
                  getItemAriaLabel={(type, page) =>
                    type === "page" ? `الصفحة ${page}` : type === "next" ? "الصفحة التالية" : type === "previous" ? "الصفحة السابقة" : type === "first" ? "الصفحة الأولى" : "الصفحة الأخيرة"
                  }
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Below lg the same filters open in a drawer at the inline start ("left" is flipped by the RTL theme). */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { lg: "none" } }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: "100vw", display: "flex", flexDirection: "column" } } }}
      >
        <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
          <FiltersPanelHeader filters={filters} onClose={() => setDrawerOpen(false)} />
          <FilterSidebar filters={filters} />
        </Box>
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
          <Button fullWidth variant="contained" size="large" onClick={() => setDrawerOpen(false)} sx={{ height: 48 }}>
            {loading ? "جاري البحث…" : total === 0 ? "لا توجد نتائج" : `عرض ${listingCount(total)}`}
          </Button>
        </Box>
      </Drawer>
    </main>
  );
}

export default function SearchPageWithSuspense() {
  return (
    <Suspense
      fallback={
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
          <LoadingState variant="cards" columns={3} count={6} label="جاري تحميل العقارات" />
        </Box>
      }
    >
      <SearchPage />
    </Suspense>
  );
}
