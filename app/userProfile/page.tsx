"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import AddHomeOutlined from "@mui/icons-material/AddHomeOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import LockResetOutlined from "@mui/icons-material/LockResetOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { useAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WishlistContext";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { useToast } from "@/shared/provider/ToastProvider";
import { api } from "@/shared/services/api";
import DataTable, { type DataTableColumn, useDataTableState } from "@/shared/ui/DataTable";
import LoadingState from "@/shared/ui/LoadingState";
import ListingTypeTag from "@/shared/ui/ListingTypeTag";
import PageBanner from "@/shared/ui/PageBanner";
import Price from "@/shared/ui/Price";
import StatusBadge, { propertyApprovalStatus } from "@/shared/ui/StatusBadge";
import { arabicErrorMessage } from "@/shared/ui/form/errorMessage";

/** The fields of GET /properties/myProperties this page uses. */
interface MyListing {
  _id: string;
  title?: string;
  price?: number;
  category?: string;
  isApproved?: boolean;
  createdAt?: string;
  approvedAt?: string;
  location?: { governorate?: string; city?: string; district?: string };
}

type TabKey = "listings" | "account";

const DATE = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "long", year: "numeric" });
const formatDate = (value?: string) => (value ? DATE.format(new Date(value)) : "—");

function MyListings({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const table = useDataTableState({ sort: { columnId: "createdAt", direction: "desc" } });
  const [toDelete, setToDelete] = useState<MyListing | null>(null);
  const queryKey = ["properties", "mine", userId];

  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.get("/properties/myProperties");
      if (!res.data?.success || !Array.isArray(res.data.data)) throw new Error("unexpected response");
      return res.data.data as MyListing[];
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/properties/deleteProperty/${id}`),
    onSuccess: (_res, id) => {
      queryClient.setQueryData<MyListing[]>(queryKey, (prev) => prev?.filter((p) => p._id !== id));
      showToast("حُذف الإعلان", "success");
      setToDelete(null);
    },
    onError: (err) => {
      showToast(arabicErrorMessage(err, "لم نتمكن من حذف الإعلان. حاول مرة أخرى."), "error");
    },
  });

  const rows = data ?? [];
  const pending = rows.filter((p) => !p.isApproved).length;

  const columns: DataTableColumn<MyListing>[] = [
    {
      id: "title",
      header: "الإعلان",
      card: "title",
      sortable: true,
      sortValue: (p) => p.title ?? "",
      cell: (p) => (
        <Box sx={{ minWidth: 0 }}>
          <MuiLink
            component={Link}
            href={`/properties/${p._id}`}
            underline="hover"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {p.title || "إعلان بدون عنوان"}
          </MuiLink>
          {p.location?.city && (
            <Typography variant="caption" color="text.secondary" component="p">
              {[p.location.district, p.location.city, p.location.governorate].filter(Boolean).join("، ")}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "status",
      header: "الحالة",
      sortable: true,
      sortValue: (p) => (p.isApproved ? 1 : 0),
      cell: (p) => <StatusBadge status={propertyApprovalStatus(p)} />,
    },
    {
      id: "category",
      header: "النوع",
      hideBelow: "lg",
      cell: (p) => (p.category ? <ListingTypeTag category={p.category} /> : "—"),
    },
    {
      id: "price",
      header: "السعر",
      align: "end",
      sortable: true,
      sortValue: (p) => p.price ?? null,
      cell: (p) => <Price amount={p.price} category={p.category} size="table" />,
    },
    {
      id: "createdAt",
      header: "تاريخ الإضافة",
      sortable: true,
      sortValue: (p) => (p.createdAt ? new Date(p.createdAt) : null),
      cell: (p) => <span className="num">{formatDate(p.createdAt)}</span>,
    },
  ];

  return (
    <Box>
      {rows.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} aria-live="polite">
          {pending > 0
            ? `لديك ${pending} ${pending === 1 ? "إعلان" : "إعلانات"} قيد المراجعة. لا يظهر الإعلان في البحث حتى يقبله فريق سكنلي.`
            : "كل إعلاناتك مقبولة وتظهر في البحث."}
        </Typography>
      )}
      <DataTable
        label="إعلاناتي"
        rows={rows}
        columns={columns}
        getRowId={(p) => p._id}
        getRowLabel={(p) => p.title || "إعلان بدون عنوان"}
        sort={table.sort}
        onSortChange={table.setSort}
        pagination={{
          page: table.page,
          pageSize: table.pageSize,
          onPageChange: table.setPage,
          onPageSizeChange: table.setPageSize,
        }}
        rowActions={(p) => [
          {
            label: "عرض الإعلان",
            icon: <VisibilityOutlined fontSize="small" />,
            onClick: () => router.push(`/properties/${p._id}`),
          },
          {
            label: "حذف الإعلان",
            icon: <DeleteOutlineOutlined fontSize="small" />,
            destructive: true,
            onClick: () => setToDelete(p),
          },
        ]}
        loading={isPending || isRefetching}
        error={isError}
        errorTitle="تعذّر تحميل إعلاناتك"
        onRetry={() => refetch()}
        empty={{
          icon: <HomeWorkOutlined />,
          title: "لم تنشر أي إعلان بعد",
          description: "أضف عقارك الأول، وسيظهر هنا مع حالة مراجعته.",
          action: (
            <Button component={Link} href="/uploadProperty" variant="contained" startIcon={<AddHomeOutlined />}>
              أضف عقارك
            </Button>
          ),
        }}
      />
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 2 }}>
        إذا رُفض إعلان أثناء المراجعة يُحذف من القائمة، ونبلغك بذلك على بريدك الإلكتروني. تعديل الإعلانات غير متاح
        حاليًا.
      </Typography>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="حذف الإعلان"
        description={
          <>
            سيُحذف «{toDelete?.title || "هذا الإعلان"}» نهائيًا مع صوره، ويختفي من البحث ومن قوائم المحفوظات. لا يمكن
            التراجع عن الحذف.
          </>
        }
        confirmLabel="حذف الإعلان"
        loadingLabel="جارٍ الحذف…"
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete._id)}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}

function AccountDetails() {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const rows: { label: string; value?: string; ltr?: boolean }[] = [
    { label: "اسم المستخدم", value: user.userName },
    { label: "الاسم", value: fullName || undefined },
    { label: "البريد الإلكتروني", value: user.email, ltr: true },
    { label: "رقم الهاتف", value: user.phone, ltr: true },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Box
        component="section"
        aria-labelledby="account-details-title"
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: "var(--r-card)",
          bgcolor: "background.paper",
          boxShadow: "var(--c-card-shadow)",
          p: { xs: 2.5, md: 3 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
          <Avatar
            src={user.avatar?.url}
            alt=""
            sx={{ width: 48, height: 48, bgcolor: "var(--c-primary-soft)", color: "primary.main", fontWeight: 600 }}
          >
            {(user.userName || user.email || "?").charAt(0).toUpperCase()}
          </Avatar>
          <Typography id="account-details-title" component="h2" variant="h5">
            بيانات الحساب
          </Typography>
        </Box>
        <Box
          component="dl"
          sx={{
            m: 0,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" },
            columnGap: 2,
            rowGap: { xs: 0.5, sm: 1.5 },
          }}
        >
          {rows.map((row) => (
            <Box key={row.label} sx={{ display: "contents" }}>
              <Typography component="dt" variant="body2" color="text.secondary" sx={{ mt: { xs: 1, sm: 0 } }}>
                {row.label}
              </Typography>
              <Typography component="dd" variant="body1" sx={{ m: 0, fontWeight: 500, overflowWrap: "anywhere" }}>
                {row.value ? row.ltr ? <span dir="ltr">{row.value}</span> : row.value : "—"}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          لتعديل بياناتك أو حذف حسابك،{" "}
          <MuiLink component={Link} href="/contact">
            راسلنا
          </MuiLink>
          .
        </Typography>
      </Box>

      <Box
        component="aside"
        aria-label="اختصارات الحساب"
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: "var(--r-card)",
          bgcolor: "background.paper",
          boxShadow: "var(--c-card-shadow)",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          alignSelf: "start",
        }}
      >
        <Button
          component={Link}
          href="/wishlist"
          startIcon={<FavoriteBorderOutlined />}
          color="inherit"
          sx={{ justifyContent: "flex-start" }}
        >
          المفضلة{wishlist.length > 0 && <span className="num">&nbsp;({wishlist.length})</span>}
        </Button>
        <Button
          component={Link}
          href="/resetPassword"
          startIcon={<LockResetOutlined />}
          color="inherit"
          sx={{ justifyContent: "flex-start" }}
        >
          تغيير كلمة المرور
        </Button>
        <Button
          onClick={() => logout()}
          startIcon={<LogoutOutlined />}
          color="error"
          sx={{ justifyContent: "flex-start" }}
        >
          تسجيل الخروج
        </Button>
      </Box>
    </div>
  );
}

function UserProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: TabKey = searchParams.get("tab") === "account" ? "account" : "listings";

  const setTab = (next: TabKey) => {
    router.replace(next === "listings" ? "/userProfile" : "/userProfile?tab=account", { scroll: false });
  };

  return (
    <Box component="main" id="main">
      <PageBanner
        title="حسابي"
        description={user ? `أهلًا ${user.userName}. تابع إعلاناتك وبيانات حسابك من هنا.` : undefined}
        actions={
          <Button component={Link} href="/uploadProperty" variant="contained" startIcon={<AddHomeOutlined />}>
            أضف عقارًا
          </Button>
        }
      >
        {/* The section tabs sit on the band's bottom edge. */}
        {!isLoading && user && (
          <Tabs
            value={tab}
            onChange={(_, value: TabKey) => setTab(value)}
            aria-label="أقسام الحساب"
            sx={{ boxShadow: "none", mb: "-1px" }}
          >
            <Tab value="listings" label="إعلاناتي" id="tab-listings" aria-controls="panel-listings" />
            <Tab value="account" label="بيانات الحساب" id="tab-account" aria-controls="panel-account" />
          </Tabs>
        )}
      </PageBanner>

      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
        {isLoading ? (
          <LoadingState variant="rows" rows={5} />
        ) : !user ? (
          // The middleware already sends signed-out visitors to /login; this covers an expired session.
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              انتهت جلستك. سجّل الدخول لعرض حسابك.
            </Typography>
            <Button component={Link} href="/login?redirect=/userProfile" variant="contained">
              تسجيل الدخول
            </Button>
          </Box>
        ) : (
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === "listings" ? <MyListings userId={user._id} /> : <AccountDetails />}
          </div>
        )}
      </Box>
    </Box>
  );
}

export default function UserProfilePageWithSuspense() {
  return (
    <Suspense fallback={<LoadingState />}>
      <UserProfilePage />
    </Suspense>
  );
}
