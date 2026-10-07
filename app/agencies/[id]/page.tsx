"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import SearchOffOutlined from "@mui/icons-material/SearchOffOutlined";
import { api } from "@/shared/services/api";
import PageBanner from "@/shared/ui/PageBanner";
import PropertyCard, { toPropertyCardData, type ListingLike } from "@/shared/ui/PropertyCard";
import CardGrid from "@/shared/ui/CardGrid";
import EmptyState from "@/shared/ui/EmptyState";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import AgencyLogo from "@/shared/ui/listing/AgencyLogo";
import { listingCount } from "@/shared/ui/listing/count";
import { TestimonialDialog, TestimonialList, useApprovedTestimonials } from "@/shared/ui/listing/Testimonials";

/**
 * GET /agencies/:id (server/Model/AgencyModel.js): name, logo, description and its approved, active
 * listings. The model has no phone, email or address, so the page shows none.
 */
interface Agency {
  _id: string;
  name: string;
  logo?: { url?: string };
  description?: string;
  properties?: (ListingLike & { _id: string })[];
}

class NotFound extends Error {}

const fetchAgency = async (id: string): Promise<Agency> => {
  try {
    const res = await api.get(`/agencies/${encodeURIComponent(id)}`);
    const agency = res.data?.data;
    if (agency && typeof agency === "object" && agency._id) return agency;
    throw new NotFound();
  } catch (err) {
    if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 400)) throw new NotFound();
    throw err;
  }
};

function AgencyTestimonials({ agency }: { agency: Agency }) {
  const [open, setOpen] = useState(false);
  const scope = { type: "agency" as const, agencyId: agency._id };
  const { data, isPending, isError, refetch, isFetching } = useApprovedTestimonials(scope);
  const writeButton = (
    <Button variant="outlined" startIcon={<RateReviewOutlined aria-hidden />} onClick={() => setOpen(true)}>
      اكتب رأيك
    </Button>
  );

  return (
    <Box component="section" aria-labelledby="agency-reviews-title" sx={{ mt: 6 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 2 }}>
        <Typography id="agency-reviews-title" component="h2" variant="h5">
          آراء العملاء
        </Typography>
        {data && data.length > 0 && writeButton}
      </Box>
      {isPending ? (
        <LoadingState compact label="جاري تحميل الآراء" />
      ) : isError ? (
        <ErrorState compact title="تعذر تحميل الآراء" onRetry={() => refetch()} retrying={isFetching} />
      ) : data.length === 0 ? (
        <EmptyState
          compact
          icon={<RateReviewOutlined />}
          title="لا توجد آراء منشورة بعد"
          description={`تعاملت مع ${agency.name}؟ شارك تجربتك.`}
          action={writeButton}
        />
      ) : (
        <TestimonialList items={data} />
      )}
      <TestimonialDialog open={open} onClose={() => setOpen(false)} scope={scope} subject={`عن ${agency.name}`} />
    </Box>
  );
}

function AgencyView({ agency }: { agency: Agency }) {
  const listings = Array.isArray(agency.properties) ? agency.properties.filter((p) => p && p._id) : [];
  return (
    <>
      <PageBanner
        media={<AgencyLogo src={agency.logo?.url} size={80} />}
        breadcrumbs={[{ label: "الرئيسية", href: "/" }, { label: "الشركات العقارية" }, { label: agency.name }]}
        title={agency.name}
        description={
          <>
            {agency.description && (
              <Box component="span" sx={{ display: "block" }}>
                {agency.description}
              </Box>
            )}
            <Box component="span" sx={{ display: "block", mt: agency.description ? 0.5 : 0, fontWeight: 600 }}>
              {listings.length > 0 ? `${listingCount(listings.length)} على سكنلي` : "لا توجد إعلانات منشورة الآن"}
            </Box>
          </>
        }
      />
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
        <Box component="section" aria-labelledby="agency-listings-title">
          <Typography id="agency-listings-title" component="h2" variant="h5" sx={{ mb: 2 }}>
            إعلانات الشركة
          </Typography>
          {listings.length === 0 ? (
            <EmptyState
              icon={<HomeWorkOutlined />}
              title="لا توجد إعلانات لهذه الشركة الآن"
              description="تصفح باقي العقارات على سكنلي."
              action={
                <Button component={Link} href="/properties" variant="outlined">
                  تصفح العقارات
                </Button>
              }
            />
          ) : (
            <CardGrid>
              {listings.map((listing, index) => {
                const card = toPropertyCardData(listing);
                return <PropertyCard key={card.id} property={card} priority={index < 2} />;
              })}
            </CardGrid>
          )}
        </Box>

        <AgencyTestimonials agency={agency} />
      </Box>
    </>
  );
}

/** /agencies/[id]: see an agency and its listings. */
export default function AgencyDetailsPage() {
  const { id } = useParams() as { id: string };
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["agency", id],
    queryFn: () => fetchAgency(id),
    enabled: Boolean(id),
    retry: (count, err) => !(err instanceof NotFound) && count < 2,
  });

  useEffect(() => {
    if (data?.name) document.title = `${data.name} | سكنلي`;
  }, [data?.name]);

  let content: React.ReactNode;
  if (isPending) {
    content = (
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        <LoadingState variant="cards" count={4} label="جاري تحميل صفحة الشركة" />
      </Box>
    );
  } else if (isError && error instanceof NotFound) {
    content = (
      <EmptyState
        icon={<SearchOffOutlined />}
        title="هذه الشركة غير موجودة"
        description="ربما حُذفت صفحتها."
        action={
          <Button component={Link} href="/" variant="contained">
            الصفحة الرئيسية
          </Button>
        }
      />
    );
  } else if (isError || !data) {
    content = <ErrorState title="تعذر تحميل صفحة الشركة" onRetry={() => refetch()} retrying={isFetching} />;
  } else {
    content = <AgencyView agency={data} />;
  }

  return <main id="main">{content}</main>;
}
