"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import EmptyState from "@/shared/ui/EmptyState";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import { TestimonialDialog, TestimonialList, useApprovedTestimonials } from "@/shared/ui/listing/Testimonials";
import HomeSection from "./HomeSection";

const SHOWN = 6;
const SCOPE = { type: "general" } as const;

/** Approved visitor testimonials, newest first, and the form to add one. */
export default function Testimonials() {
  const [open, setOpen] = useState(false);
  const { data, isPending, isError, refetch, isFetching } = useApprovedTestimonials(SCOPE);

  const writeButton = (
    <Button variant="outlined" startIcon={<RateReviewOutlined aria-hidden />} onClick={() => setOpen(true)}>
      اكتب رأيك
    </Button>
  );

  return (
    <HomeSection id="home-testimonials" title="آراء المستخدمين" action={data && data.length > 0 ? writeButton : undefined}>
      {isPending ? (
        <LoadingState compact label="جاري تحميل الآراء" />
      ) : isError ? (
        <ErrorState compact title="تعذر تحميل الآراء" onRetry={() => refetch()} retrying={isFetching} />
      ) : data.length === 0 ? (
        <EmptyState
          compact
          icon={<RateReviewOutlined />}
          title="لا توجد آراء منشورة بعد"
          description="جربت سكنلي؟ شاركنا رأيك ليستفيد منه غيرك."
          action={writeButton}
        />
      ) : (
        <TestimonialList items={data.slice(0, SHOWN)} />
      )}
      <TestimonialDialog open={open} onClose={() => setOpen(false)} scope={SCOPE} subject="عن سكنلي" />
    </HomeSection>
  );
}
