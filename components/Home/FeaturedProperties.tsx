"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Button from "@mui/material/Button";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import { api } from "@/shared/services/api";
import PropertyCard, { toPropertyCardData, type ListingLike } from "@/shared/ui/PropertyCard";
import CardGrid from "@/shared/ui/CardGrid";
import LoadingState from "@/shared/ui/LoadingState";
import ErrorState from "@/shared/ui/ErrorState";
import EmptyState from "@/shared/ui/EmptyState";
import HomeSection from "./HomeSection";

const SHOWN = 8;

/** GET /properties/featured: the ten most viewed approved, active listings. */
const fetchFeatured = async (): Promise<ListingLike[]> => {
  const res = await api.get("/properties/featured");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const viewAll = (
  <Button component={Link} href="/properties" endIcon={<ArrowBackOutlined aria-hidden />} sx={{ px: 1 }}>
    كل العقارات
  </Button>
);

export default function FeaturedProperties() {
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["properties", "featured"],
    queryFn: fetchFeatured,
  });

  let content: React.ReactNode;
  if (isPending) {
    content = <LoadingState variant="cards" count={4} label="جاري تحميل الإعلانات" />;
  } else if (isError) {
    content = (
      <ErrorState compact title="تعذر تحميل الإعلانات" onRetry={() => refetch()} retrying={isFetching} />
    );
  } else if (data.length === 0) {
    content = (
      <EmptyState
        compact
        icon={<HomeWorkOutlined />}
        title="لا توجد إعلانات منشورة بعد"
        description="ستظهر هنا الإعلانات الأكثر مشاهدة بعد نشرها."
      />
    );
  } else {
    content = (
      <CardGrid>
        {data.slice(0, SHOWN).map((listing, index) => {
          const property = toPropertyCardData(listing);
          return <PropertyCard key={property.id} property={property} priority={index < 2} />;
        })}
      </CardGrid>
    );
  }

  return (
    <HomeSection
      id="home-featured"
      title="الإعلانات الأكثر مشاهدة"
      description="مرتبة حسب عدد مرات المشاهدة."
      action={viewAll}
    >
      {content}
    </HomeSection>
  );
}
