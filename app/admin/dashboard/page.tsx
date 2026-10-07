"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import MailOutlineOutlined from "@mui/icons-material/MailOutlineOutlined";
import PeopleOutlineOutlined from "@mui/icons-material/PeopleOutlineOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import { pendingPropertiesQuery } from "@/shared/services/pendingProperties";
import EmptyState from "@/shared/ui/EmptyState";
import ErrorState from "@/shared/ui/ErrorState";
import ListingTypeTag from "@/shared/ui/ListingTypeTag";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";
import Price from "@/shared/ui/Price";
import StatusBadge, { propertyApprovalStatus } from "@/shared/ui/StatusBadge";
import { formatCount, formatDate } from "@/shared/ui/admin/format";
import {
  analyticsQuery,
  contactsQuery,
  propertyInquiriesQuery,
  testimonialsQuery,
  usersQuery,
} from "@/shared/ui/admin/queries";
import { userStatusBadge } from "@/shared/ui/admin/statuses";

/** A count that may be unknown: a skeleton while loading, a dash and a retry after a failure, never 0. */
function CountValue({
  value,
  loading,
  error,
  onRetry,
  label,
  size = "1.75rem",
}: {
  value: number | null | undefined;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  label: string;
  size?: string;
}) {
  if (loading && value == null) return <Skeleton variant="text" width={56} sx={{ fontSize: size }} />;
  if (error || value == null) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography component="span" sx={{ fontSize: size, fontWeight: 700, color: "text.secondary" }} aria-label="غير متاح">
          —
        </Typography>
        <Tooltip title="إعادة المحاولة">
          <IconButton size="small" onClick={onRetry} aria-label={`إعادة تحميل: ${label}`}>
            <RefreshOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }
  return (
    <Typography component="span" sx={{ fontSize: size, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.3 }}>
      {formatCount(value)}
    </Typography>
  );
}

const panelSx = { border: 1, borderColor: "divider", borderRadius: "10px", bgcolor: "background.paper" } as const;

/** One "needs action" item: what is waiting, how many, and the link that deals with it. */
function AttentionTile({
  icon,
  label,
  href,
  linkLabel,
  detail,
  ...count
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  linkLabel: string;
  detail?: React.ReactNode;
  value: number | null | undefined;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const waiting = typeof count.value === "number" && count.value > 0;
  return (
    <Box
      component="li"
      sx={{
        ...panelSx,
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        borderColor: waiting ? "color-mix(in srgb, var(--c-warning) 45%, transparent)" : "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: waiting ? "var(--c-warning)" : "text.secondary" }}>
        <Box aria-hidden sx={{ display: "flex", "& svg": { fontSize: 20 } }}>
          {icon}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
          {label}
        </Typography>
      </Box>
      <CountValue {...count} label={label} />
      {detail && (
        <Typography variant="caption" color="text.secondary">
          {detail}
        </Typography>
      )}
      <MuiLink component={Link} href={href} underline="hover" sx={{ mt: "auto", pt: 1, fontSize: "0.875rem", fontWeight: 600 }}>
        {linkLabel}
      </MuiLink>
    </Box>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Typography id={id} component="h2" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

const RECENT_USERS = { page: 1, limit: 5, search: "" };
const NEW_INQUIRIES = { page: 1, limit: 1, status: "new" as const, search: "" };

export default function AdminDashboardPage() {
  const pending = useQuery(pendingPropertiesQuery);
  const pendingTestimonials = useQuery(testimonialsQuery("pending"));
  const newInquiries = useQuery(propertyInquiriesQuery(NEW_INQUIRIES));
  const contacts = useQuery(contactsQuery);
  const analytics = useQuery(analyticsQuery);
  const recentUsers = useQuery(usersQuery(RECENT_USERS));

  const p = pending.data;
  const pendingTotal = p ? p.sale.length + p.rent.length + p.student.length : null;
  const pendingDetail =
    p && pendingTotal
      ? [
          p.sale.length && `${formatCount(p.sale.length)} للبيع`,
          p.rent.length && `${formatCount(p.rent.length)} للإيجار`,
          p.student.length && `${formatCount(p.student.length)} سكن طلابي`,
        ]
          .filter(Boolean)
          .join("، ")
      : undefined;
  const newContacts = contacts.data ? contacts.data.filter((m) => m.status === "pending").length : null;

  const a = analytics.data;
  const totals: { label: string; value: number | null | undefined; icon: React.ReactNode; href: string }[] = [
    { label: "المستخدمون", value: a?.userCount, icon: <PeopleOutlineOutlined />, href: "/admin/dashboard/users" },
    { label: "العقارات", value: a?.propertyCount, icon: <HomeWorkOutlined />, href: "/admin/dashboard/properties" },
    { label: "الوكالات", value: a?.agencyCount, icon: <BusinessOutlined />, href: "/admin/dashboard/agencies" },
    { label: "آراء العملاء", value: a?.testimonialCount, icon: <RateReviewOutlined />, href: "/admin/dashboard/testimonials" },
    { label: "استفسارات العقارات", value: a?.inquiryCount, icon: <ForumOutlined />, href: "/admin/dashboard/inquiries" },
    { label: "رسائل التواصل", value: a?.contactCount, icon: <MailOutlineOutlined />, href: "/admin/dashboard/inquiries" },
  ];

  return (
    <>
      <PageHeader
        title="لوحة المعلومات"
        description="ما ينتظر متابعتك الآن، ثم أرقام الموقع وأحدث النشاط."
        actions={
          <>
            <Button component={Link} href="/admin/import-properties" variant="outlined" startIcon={<UploadFileOutlined />}>
              استيراد عقارات
            </Button>
            <Button component={Link} href="/admin/dashboard/properties" variant="contained">
              مراجعة الإعلانات
            </Button>
          </>
        }
      />

      <Box component="section" aria-labelledby="attention-title" sx={{ mb: 4 }}>
        <SectionTitle id="attention-title">يحتاج إلى متابعة</SectionTitle>
        <Box
          component="ul"
          sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" } }}
        >
          <AttentionTile
            icon={<HomeWorkOutlined />}
            label="إعلانات قيد المراجعة"
            value={pendingTotal}
            loading={pending.isLoading}
            error={pending.isError}
            onRetry={() => pending.refetch()}
            detail={pendingDetail}
            href="/admin/dashboard/properties"
            linkLabel="مراجعة الإعلانات"
          />
          <AttentionTile
            icon={<RateReviewOutlined />}
            label="آراء قيد المراجعة"
            value={pendingTestimonials.data?.length}
            loading={pendingTestimonials.isLoading}
            error={pendingTestimonials.isError}
            onRetry={() => pendingTestimonials.refetch()}
            href="/admin/dashboard/testimonials"
            linkLabel="مراجعة الآراء"
          />
          <AttentionTile
            icon={<ForumOutlined />}
            label="استفسارات جديدة عن العقارات"
            value={newInquiries.data?.total}
            loading={newInquiries.isLoading}
            error={newInquiries.isError}
            onRetry={() => newInquiries.refetch()}
            href="/admin/dashboard/inquiries"
            linkLabel="عرض الاستفسارات"
          />
          <AttentionTile
            icon={<MailOutlineOutlined />}
            label="رسائل تواصل جديدة"
            value={newContacts}
            loading={contacts.isLoading}
            error={contacts.isError}
            onRetry={() => contacts.refetch()}
            href="/admin/dashboard/inquiries"
            linkLabel="عرض الرسائل"
          />
        </Box>
      </Box>

      <Box component="section" aria-labelledby="totals-title" sx={{ mb: 4 }}>
        <SectionTitle id="totals-title">أرقام الموقع</SectionTitle>
        <Box
          component="ul"
          sx={{
            ...panelSx,
            listStyle: "none",
            m: 0,
            p: 0,
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)", xl: "repeat(6, 1fr)" },
            overflow: "hidden",
          }}
        >
          {totals.map((t) => (
            <Box
              component="li"
              key={t.label}
              sx={{ p: 2, borderInlineEnd: 1, borderBottom: 1, borderColor: "divider", marginInlineEnd: "-1px", marginBottom: "-1px" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", mb: 0.5 }}>
                <Box aria-hidden sx={{ display: "flex", "& svg": { fontSize: 18 } }}>
                  {t.icon}
                </Box>
                <MuiLink component={Link} href={t.href} underline="hover" color="inherit" sx={{ fontSize: "0.8125rem" }}>
                  {t.label}
                </MuiLink>
              </Box>
              <CountValue
                value={t.value}
                loading={analytics.isLoading}
                error={analytics.isError}
                onRetry={() => analytics.refetch()}
                label={t.label}
                size="1.5rem"
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Box component="section" aria-labelledby="recent-title">
        <SectionTitle id="recent-title">أحدث النشاط</SectionTitle>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
          <Box sx={{ ...panelSx, overflow: "hidden" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
              <Typography component="h3" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                أحدث الإعلانات
              </Typography>
              <MuiLink component={Link} href="/admin/dashboard/properties" underline="hover" sx={{ fontSize: "0.875rem" }}>
                كل الإعلانات
              </MuiLink>
            </Box>
            {analytics.isLoading ? (
              <LoadingState variant="rows" rows={5} />
            ) : analytics.isError ? (
              <ErrorState compact title="تعذّر تحميل أحدث الإعلانات" onRetry={() => analytics.refetch()} retrying={analytics.isFetching} />
            ) : !a?.recentProperties.length ? (
              <EmptyState compact title="لا توجد إعلانات بعد" description="تظهر هنا الإعلانات فور إضافتها." />
            ) : (
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                {a.recentProperties.map((rp) => (
                  <Box
                    component="li"
                    key={rp._id}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25, borderBottom: 1, borderColor: "divider", "&:last-of-type": { borderBottom: 0 } }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <MuiLink
                        component={Link}
                        href={`/properties/${rp._id}`}
                        underline="hover"
                        color="text.primary"
                        sx={{ fontSize: "0.875rem", fontWeight: 600, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {rp.title}
                      </MuiLink>
                      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 1, rowGap: 0.5, mt: 0.5 }}>
                        <ListingTypeTag category={rp.category} />
                        <Price amount={rp.price} category={rp.category} size="table" />
                        {rp.location?.city && (
                          <Typography variant="caption" color="text.secondary">
                            {rp.location.city}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: "end", flexShrink: 0 }}>
                      <StatusBadge status={propertyApprovalStatus(rp)} />
                      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
                        {formatDate(rp.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ ...panelSx, overflow: "hidden" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
              <Typography component="h3" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                أحدث المستخدمين
              </Typography>
              <MuiLink component={Link} href="/admin/dashboard/users" underline="hover" sx={{ fontSize: "0.875rem" }}>
                كل المستخدمين
              </MuiLink>
            </Box>
            {recentUsers.isLoading ? (
              <LoadingState variant="rows" rows={5} />
            ) : recentUsers.isError ? (
              <ErrorState compact title="تعذّر تحميل أحدث المستخدمين" onRetry={() => recentUsers.refetch()} retrying={recentUsers.isFetching} />
            ) : !recentUsers.data?.rows.length ? (
              <EmptyState compact title="لا يوجد مستخدمون بعد" description="يظهر هنا كل من ينشئ حسابًا." />
            ) : (
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                {recentUsers.data.rows.map((u) => (
                  <Box
                    component="li"
                    key={u._id}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25, borderBottom: 1, borderColor: "divider", "&:last-of-type": { borderBottom: 0 } }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {[u.firstName, u.lastName].filter(Boolean).join(" ") || u.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere" }}>
                        {u.email}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "end", flexShrink: 0 }}>
                      <StatusBadge {...userStatusBadge(u.status)} />
                      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
                        {formatDate(u.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
