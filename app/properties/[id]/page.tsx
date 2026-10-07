"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import SearchOffOutlined from "@mui/icons-material/SearchOffOutlined";
import ShareOutlined from "@mui/icons-material/ShareOutlined";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/shared/provider/ToastProvider";
import { api } from "@/shared/services/api";
import PropertyGallery from "@/shared/components/PropertyGallery";
import ContactCard, { ContactButtons, contactChannels, type ContactSource } from "@/shared/components/ContactCard";
import PageHeader from "@/shared/ui/PageHeader";
import Price, { formatNumber } from "@/shared/ui/Price";
import ListingFacts from "@/shared/ui/ListingFacts";
import ListingTypeTag from "@/shared/ui/ListingTypeTag";
import PropertyCard, { FavoriteToggle, toPropertyCardData, type ListingLike } from "@/shared/ui/PropertyCard";
import CardGrid from "@/shared/ui/CardGrid";
import LoadingState from "@/shared/ui/LoadingState";
import ErrorState from "@/shared/ui/ErrorState";
import EmptyState from "@/shared/ui/EmptyState";
import { hasCoordinates } from "@/shared/ui/listing/leaflet";
import { yearsLabel } from "@/shared/ui/listing/usePropertyFilters";

// Client-only and heavy: these load after the listing renders.
const PropertyLocationMap = dynamic(() => import("@/shared/components/PropertyLocationMap"), {
  ssr: false,
  loading: () => <LoadingState compact label="جاري تحميل الخريطة" />,
});
const CommentSection = dynamic(() => import("@/shared/components/CommentSection"), {
  ssr: false,
  loading: () => <LoadingState variant="rows" rows={3} label="جاري تحميل التعليقات" />,
});
const MortgageCalculator = dynamic(() => import("@/shared/components/MortgageCalculator"), {
  ssr: false,
  loading: () => <LoadingState compact />,
});

/** The listing as GET /properties/propertyDetails/:id returns it (server/Model/PropertyModel.js). */
interface Listing extends ContactSource {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  category: string;
  price: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  location?: { address?: string; city?: string; district?: string; latitude?: number; longitude?: number };
  images?: { url: string; isMain?: boolean }[];
  amenities?: string[];
  status?: string;
  isNegotiable?: boolean;
  isStudentFriendly?: boolean;
  downPayment?: number;
  installmentPeriodInYears?: number;
  studentHousingDetails?: {
    isEnabled?: boolean;
    roomType?: "private" | "shared" | "dormitory" | null;
    studentsPerRoom?: number;
    genderPolicy?: "male" | "female" | "mixed" | null;
    academicYearOnly?: boolean;
    nearbyUniversities?: { name?: string; distanceInKm?: number }[];
  };
  views?: number;
  createdAt?: string;
}

const STATUS: Record<string, string> = {
  available: "متاح",
  rented: "مؤجَّر",
  sold: "مُباع",
  pending: "محجوز مبدئيًا",
  inactive: "غير متاح",
};
const ROOM_TYPE: Record<string, string> = { private: "غرفة خاصة", shared: "غرفة مشتركة", dormitory: "سكن جماعي" };
const GENDER: Record<string, string> = { male: "للطلاب", female: "للطالبات", mixed: "للطلاب والطالبات" };
const DATE = new Intl.DateTimeFormat("ar-EG", { dateStyle: "long" });

class NotFound extends Error {}

const fetchListing = async (id: string): Promise<Listing> => {
  try {
    const res = await api.get(`/properties/propertyDetails/${encodeURIComponent(id)}`);
    const details = res.data?.data;
    if (res.data?.success && details && typeof details === "object" && !Array.isArray(details)) return details;
    throw new NotFound();
  } catch (err) {
    // 404: missing, or not public and not yours. 400: a malformed id.
    if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 400)) throw new NotFound();
    throw err;
  }
};

/** Remembers the last 10 listings this browser opened (read by nothing yet; kept from the earlier page). */
const rememberViewed = (id: string) => {
  try {
    const raw = JSON.parse(localStorage.getItem("recentlyViewedProperties") || "[]");
    const list = Array.isArray(raw) ? raw.filter((v) => v !== id) : [];
    localStorage.setItem("recentlyViewedProperties", JSON.stringify([id, ...list].slice(0, 10)));
  } catch {
    // Storage blocked: nothing to remember.
  }
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Box component="section" aria-labelledby={id} sx={{ py: 3, borderTop: 1, borderColor: "divider" }}>
      <Typography id={id} component="h2" variant="h5" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

/** Label/value pairs as a description list, two columns from sm. */
function DetailList({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <Box
      component="dl"
      sx={{ m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, columnGap: 3 }}
    >
      {items.map(([label, value]) => (
        <Box
          key={label}
          sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 1.25, borderBottom: 1, borderColor: "divider" }}
        >
          <Typography component="dt" variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 500, textAlign: "end", fontVariantNumeric: "tabular-nums" }}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function ShareButton({ title }: { title: string }) {
  const { showToast } = useToast();
  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("نُسخ رابط الإعلان.", "success");
    } catch {
      showToast("تعذر نسخ الرابط.", "error");
    }
  };
  return (
    <Button variant="outlined" color="secondary" startIcon={<ShareOutlined aria-hidden />} onClick={share}>
      مشاركة
    </Button>
  );
}

function SimilarListings({ id }: { id: string }) {
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["properties", "similar", id],
    queryFn: async (): Promise<ListingLike[]> => {
      const res = await api.get(`/properties/similar/${encodeURIComponent(id)}`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });
  if (!isPending && !isError && data.length === 0) return null;
  return (
    <Section id="similar-title" title="إعلانات مشابهة">
      {isPending ? (
        <LoadingState variant="cards" count={4} label="جاري تحميل إعلانات مشابهة" />
      ) : isError ? (
        <ErrorState compact title="تعذر تحميل الإعلانات المشابهة" onRetry={() => refetch()} retrying={isFetching} />
      ) : (
        <CardGrid>
          {data.map((listing) => {
            const card = toPropertyCardData(listing);
            return <PropertyCard key={card.id} property={card} />;
          })}
        </CardGrid>
      )}
    </Section>
  );
}

/**
 * The phone bar: price and the call / WhatsApp buttons pinned to the bottom below lg. The floating chatbot
 * button sits at the bottom physical-right corner, which is the inline start in this RTL site, so the bar
 * keeps that corner free.
 */
function MobileContactBar({ listing }: { listing: Listing }) {
  const channels = contactChannels(listing);
  return (
    <Box
      sx={{
        display: { xs: "flex", lg: "none" },
        position: "fixed",
        insetInline: 0,
        bottom: 0,
        // Below the chatbot button (zIndex fab), which floats over the reserved corner.
        zIndex: "mobileStepper",
        height: 68,
        alignItems: "center",
        gap: 1,
        paddingInlineStart: "88px",
        paddingInlineEnd: 2,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Price amount={listing.price} category={listing.category} size="card" />
      </Box>
      {channels.phone || channels.whatsapp ? (
        <ContactButtons channels={channels} title={listing.title} size="medium" />
      ) : (
        <Button component="a" href="#contact" variant="contained">
          أرسل استفسارًا
        </Button>
      )}
    </Box>
  );
}

function ListingView({ listing }: { listing: Listing }) {
  const { user } = useAuth();
  const card = toPropertyCardData(listing);
  const where = [listing.location?.address, listing.location?.district, listing.location?.city].filter(Boolean).join("، ");
  const student = listing.studentHousingDetails;
  const showStudent = Boolean(listing.isStudentFriendly || student?.isEnabled);
  const amenities = Array.isArray(listing.amenities) ? listing.amenities.filter(Boolean) : [];

  const details: [string, React.ReactNode][] = [];
  if (listing.type) details.push(["نوع العقار", listing.type]);
  if (listing.status && STATUS[listing.status]) details.push(["الحالة", STATUS[listing.status]]);
  if (typeof listing.floor === "number")
    details.push(["الطابق", typeof listing.totalFloors === "number" ? `${listing.floor} من ${listing.totalFloors}` : String(listing.floor)]);
  if (typeof listing.downPayment === "number" && listing.downPayment > 0)
    details.push(["المقدم", `${formatNumber(listing.downPayment)} ج.م`]);
  if (typeof listing.installmentPeriodInYears === "number" && listing.installmentPeriodInYears > 0)
    details.push(["مدة التقسيط", yearsLabel(listing.installmentPeriodInYears)]);
  if (typeof listing.views === "number") details.push(["المشاهدات", formatNumber(listing.views)]);
  if (listing.createdAt) details.push(["تاريخ الإضافة", DATE.format(new Date(listing.createdAt))]);

  const studentItems: [string, React.ReactNode][] = [];
  if (student?.roomType && ROOM_TYPE[student.roomType]) studentItems.push(["نوع السكن", ROOM_TYPE[student.roomType]]);
  if (typeof student?.studentsPerRoom === "number") studentItems.push(["عدد الطلاب في الغرفة", String(student.studentsPerRoom)]);
  if (student?.genderPolicy && GENDER[student.genderPolicy]) studentItems.push(["مخصص", GENDER[student.genderPolicy]]);
  if (student?.academicYearOnly) studentItems.push(["مدة الإيجار", "العام الدراسي فقط"]);
  const universities = (student?.nearbyUniversities ?? []).filter((u) => u?.name);

  return (
    <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: { xs: 13, lg: 6 } }}>
      <PageHeader
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "العقارات", href: "/properties" },
          ...(listing.location?.city
            ? [{ label: listing.location.city, href: `/properties?location.city=${encodeURIComponent(listing.location.city)}` }]
            : []),
          { label: listing.title },
        ]}
        title={listing.title}
        description={
          where ? (
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
              <LocationOnOutlined aria-hidden sx={{ fontSize: 18 }} />
              {where}
            </Box>
          ) : undefined
        }
        actions={
          <>
            <FavoriteToggle property={card} />
            <ShareButton title={listing.title} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <Box sx={{ minWidth: 0 }}>
          <PropertyGallery images={listing.images ?? []} title={listing.title} />

          {/* The price block: the page's bold element. */}
          <Box sx={{ py: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
              <Price amount={listing.price} category={listing.category} size="detail" />
              <ListingTypeTag category={listing.category} />
              {listing.isNegotiable && (
                <Typography component="span" variant="body2" color="text.secondary">
                  قابل للتفاوض
                </Typography>
              )}
            </Box>
            <ListingFacts area={listing.area} bedrooms={listing.bedrooms} bathrooms={listing.bathrooms} size="detail" />
          </Box>

          {listing.description && (
            <Section id="description-title" title="الوصف">
              <Typography variant="body1" sx={{ whiteSpace: "pre-line", overflowWrap: "anywhere", maxWidth: "72ch" }}>
                {listing.description}
              </Typography>
            </Section>
          )}

          {details.length > 0 && (
            <Section id="details-title" title="التفاصيل">
              <DetailList items={details} />
            </Section>
          )}

          {amenities.length > 0 && (
            <Section id="amenities-title" title="المرافق">
              <Box
                component="ul"
                sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1 }}
              >
                {amenities.map((amenity) => (
                  <Box component="li" key={amenity} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckOutlined aria-hidden sx={{ fontSize: 18, color: "primary.main" }} />
                    <Typography variant="body2">{amenity}</Typography>
                  </Box>
                ))}
              </Box>
            </Section>
          )}

          {showStudent && (studentItems.length > 0 || universities.length > 0) && (
            <Section id="student-title" title="سكن الطلاب">
              {studentItems.length > 0 && <DetailList items={studentItems} />}
              {universities.length > 0 && (
                <Box sx={{ mt: studentItems.length ? 2 : 0 }}>
                  <Typography variant="subtitle2" component="h3" sx={{ mb: 1 }}>
                    جامعات قريبة
                  </Typography>
                  <Box component="ul" sx={{ m: 0, paddingInlineStart: 2.5 }}>
                    {universities.map((u) => (
                      <li key={u.name}>
                        <Typography variant="body2">
                          {u.name}
                          {typeof u.distanceInKm === "number" ? ` (${formatNumber(u.distanceInKm)} كم)` : ""}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </Box>
              )}
            </Section>
          )}

          <Section id="location-title" title="الموقع">
            {hasCoordinates(listing.location) ? (
              <PropertyLocationMap
                latitude={listing.location!.latitude as number}
                longitude={listing.location!.longitude as number}
                title={listing.title}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {where ? `${where}. ` : ""}لم يحدد المالك موقع العقار على الخريطة.
              </Typography>
            )}
          </Section>

          {listing.category === "sale" && typeof listing.price === "number" && listing.price > 0 && (
            <Box sx={{ py: 3, borderTop: 1, borderColor: "divider" }}>
              <Accordion
                disableGutters
                elevation={0}
                slotProps={{ heading: { component: "h2" } }}
                sx={{ border: 1, borderColor: "divider", borderRadius: "10px", "&::before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreOutlined />} aria-controls="installment-panel" id="installment-header">
                  <Typography component="span" variant="h6">
                    احسب القسط الشهري
                  </Typography>
                </AccordionSummary>
                <AccordionDetails id="installment-panel">
                  <MortgageCalculator
                    price={listing.price}
                    downPayment={listing.downPayment}
                    termInYears={listing.installmentPeriodInYears}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          )}

          <Box sx={{ py: 3, borderTop: 1, borderColor: "divider" }}>
            <CommentSection propertyId={listing._id} isAuthenticated={Boolean(user)} />
          </Box>
        </Box>

        <Box id="contact" component="aside" aria-label="التواصل" sx={{ minWidth: 0, scrollMarginTop: 80 }}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 80 } }}>
            <ContactCard listing={listing} propertyId={listing._id} title={listing.title} />
          </Box>
        </Box>
      </div>

      <SimilarListings id={listing._id} />
      <MobileContactBar listing={listing} />
    </Box>
  );
}

/** /properties/[id]: judge the listing and contact the owner. */
export default function PropertyDetailsPage() {
  const { id } = useParams() as { id: string };
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchListing(id),
    enabled: Boolean(id),
    retry: (count, err) => !(err instanceof NotFound) && count < 2,
  });

  useEffect(() => {
    if (id) rememberViewed(id);
  }, [id]);

  useEffect(() => {
    if (data?.title) document.title = `${data.title} | سكنلي`;
  }, [data?.title]);

  let content: React.ReactNode;
  if (isPending) {
    content = (
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, py: 3 }}>
        <LoadingState variant="detail" label="جاري تحميل الإعلان" />
      </Box>
    );
  } else if (isError && error instanceof NotFound) {
    content = (
      <EmptyState
        icon={<SearchOffOutlined />}
        title="هذا الإعلان غير موجود"
        description="ربما حذفه صاحبه، أو لم يُنشر بعد."
        action={
          <Button component={Link} href="/properties" variant="contained">
            تصفح العقارات
          </Button>
        }
      />
    );
  } else if (isError || !data) {
    content = <ErrorState title="تعذر تحميل الإعلان" onRetry={() => refetch()} retrying={isFetching} />;
  } else {
    content = <ListingView listing={data} />;
  }

  return <main id="main">{content}</main>;
}
