/** @format */

"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Pagination,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import FilterSidebar from "@/shared/components/FilterSidebar";
import PropertyMap from "@/shared/components/PropertyMap";
import { Property } from "@/shared/types";
import Head from "next/head";
import {
  Map as MapIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import PropertyCard, { toPropertyCardData } from "@/shared/ui/PropertyCard";
import CardGrid from "@/shared/ui/CardGrid";

import { TransitionGroup, CSSTransition } from "react-transition-group";
import { api } from "@/shared/services/api";

const SearchPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const [showFilters, setShowFilters] = useState<boolean>(true);

  const filterButtonsRef = useRef<HTMLDivElement>(null);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  // Pagination state and logic
  // const [currentPage, setCurrentPage] = useState<number>(1);
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [limitPerPage, setLimitPerPage] = useState<number>(9);
  const [totalProperties, setTotalProperties] = useState<number>(0);

  const totalPages = Math.ceil(totalProperties / limitPerPage);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", value.toString());
    router.push(`/properties?${newSearchParams.toString()}`, { scroll: false });
  };

  // A string key: the searchParams object identity changes on every navigation.
  const searchKey = searchParams.toString();
  const [reloadKey, setReloadKey] = useState(0);

  const fetchProperties = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const currentSearchParams = new URLSearchParams(searchKey);
      const page = currentSearchParams.get("page") || "1";
      const limit = currentSearchParams.get("limit") || limitPerPage.toString();

      currentSearchParams.set("page", page);
      currentSearchParams.set("limit", limit);
      currentSearchParams.set("isApproved", "true");

      const response = await api.get(`/properties/allProperties?${currentSearchParams.toString()}`, { signal });
      if (signal.aborted) return;

      if (response.data.success) {
        setProperties(response.data.data);
        setTotalProperties(response.data.pagination.totalDocs);
      } else {
        setError(response.data.message || "Failed to fetch properties.");
      }
    } catch (err) {
      // A newer filter state superseded this request; its result must not overwrite the newer one.
      if (axios.isCancel(err)) return;
      setError("تعذر تحميل العقارات. تحقق من الاتصال ثم أعد المحاولة.");
    }
    if (!signal.aborted) setLoading(false);
  }, [searchKey, limitPerPage]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProperties(controller.signal);
    return () => controller.abort();
  }, [fetchProperties, reloadKey]);

  const handlePropertySelect = (property: Property | null) => {
    setSelectedProperty(property);
  };

  const updateFilter = (
    category?: "sale" | "rent",
    isStudentFriendly?: boolean
  ) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    current.delete("category");
    current.delete("isStudentFriendly");
    // A different category has different pages.
    current.delete("page");

    if (category) {
      current.set("category", category);
    }
    if (isStudentFriendly) {
      current.set("isStudentFriendly", "true");
    }

    const query = current.toString();
    const newUrl = query ? `?${query}` : "";

    router.push(`${window.location.pathname}${newUrl}`, { scroll: false });
  };

  const handleViewModeChange = (mode: "list" | "map") => {
    setViewMode(mode);
    setShowFilters(mode === "list");
  };

  return (
    <>
      <Box sx={{ 
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
        transition: 'background-color 0.3s, color 0.3s',
      }}>
      <Head>
        <title>عقارات للايجار والبيع في مصر | سكنلي</title>
        <meta
          name="description"
          content="ابحث عن أفضل العقارات للإيجار والبيع في مصر على منصة سكنلي. شقق، فلل، محلات، استوديوهات، ودوبلكس."
        />
      </Head>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}>
        <FilterSidebar />
        <Box
          sx={{
            flexGrow: 1,
            p: isMobile ? 2 : 3,
            backgroundColor: "#f8f9fa"
          }}>
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 2 : 0
            }}>
            <TransitionGroup component={null}>
              {showFilters && (
                <CSSTransition
                  nodeRef={filterButtonsRef}
                  key="filters"
                  timeout={300}
                  classNames="filter-buttons">
                  <Box
                    ref={filterButtonsRef}
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant={
                        !searchParams.get("category") &&
                        !searchParams.get("isStudentFriendly")
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => updateFilter()}
                      sx={{ minWidth: "150px" }}>
                      كل العقارات
                    </Button>
                    <Button
                      variant={
                        searchParams.get("category") === "sale"
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => updateFilter("sale")}
                      sx={{ minWidth: "150px" }}>
                      عقارات للبيع
                    </Button>
                    <Button
                      variant={
                        searchParams.get("category") === "rent"
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => updateFilter("rent")}
                      sx={{ minWidth: "150px" }}>
                      عقارات للإيجار
                    </Button>
                    <Button
                      variant={
                        searchParams.get("isStudentFriendly") === "true"
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => updateFilter(undefined, true)}
                      sx={{ minWidth: "150px" }}>
                      عقارات للطلاب
                    </Button>
                  </Box>
                </CSSTransition>
              )}
            </TransitionGroup>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant={viewMode === "list" ? "contained" : "outlined"}
                startIcon={<ViewListIcon />}
                onClick={() => handleViewModeChange("list")}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 2,
                  gap: 1
                }}>
                قائمة
              </Button>
              <Button
                variant={viewMode === "map" ? "contained" : "outlined"}
                startIcon={<MapIcon />}
                onClick={() => handleViewModeChange("map")}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 2,
                  gap: 1
                }}>
                خريطة
              </Button>
            </Box>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px"
              }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                fontSize: "1rem"
              }}
              action={
                <Button color="inherit" size="small" onClick={() => setReloadKey((k) => k + 1)}>
                  إعادة المحاولة
                </Button>
              }>
              {error}
            </Alert>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            properties.length === 0 &&
            totalProperties === 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "400px",
                  flexDirection: "column",
                  gap: 2
                }}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontSize: "1.2rem" }}>
                  لا توجد عقارات متاحة حالياً
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  جرب تعديل معايير البحث أو المرشحات
                </Typography>
              </Box>
            )}

          {/* Properties Grid */}
          {!loading &&
            !error &&
            properties.length > 0 &&
            viewMode === "list" && (
              <CardGrid>
                {properties.map((property: any, index: number) => (
                  <PropertyCard
                    key={property._id}
                    property={toPropertyCardData(property)}
                    priority={index < 4}
                  />
                ))}
              </CardGrid>
            )}

          {/* Map View */}
          {!loading &&
            !error &&
            properties.length > 0 &&
            viewMode === "map" && (
              <Box
                sx={{ height: "600px", borderRadius: 2, overflow: "hidden" }}>
                <PropertyMap
                  properties={properties}
                  onPropertySelect={handlePropertySelect}
                  selectedProperty={selectedProperty}
                />
              </Box>
            )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 5,
                mb: 3
              }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                size={isMobile ? "medium" : "large"}
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 2,
                    fontWeight: "bold"
                  }
                }}
              />
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    </>
  );
};

export default function SearchPageWithSuspense() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
