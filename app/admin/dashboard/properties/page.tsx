"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import MuiLink from "@mui/material/Link";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import DoneAllOutlined from "@mui/icons-material/DoneAllOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import TaskAltOutlined from "@mui/icons-material/TaskAltOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { useToast } from "@/shared/provider/ToastProvider";
import { api } from "@/shared/services/api";
import {
  flattenPending,
  invalidatePending,
  pendingPropertiesQuery,
  type PendingProperty,
} from "@/shared/services/pendingProperties";
import DataTable, { useDataTableState, type DataTableColumn } from "@/shared/ui/DataTable";
import ListingTypeTag from "@/shared/ui/ListingTypeTag";
import PageHeader from "@/shared/ui/PageHeader";
import Price from "@/shared/ui/Price";
import StatusBadge from "@/shared/ui/StatusBadge";
import ListingThumb from "@/shared/ui/admin/ListingThumb";
import SearchField from "@/shared/ui/admin/SearchField";
import { adminErrorMessage } from "@/shared/ui/admin/errors";
import { dateValue, formatCount, formatDate, listingsCount } from "@/shared/ui/admin/format";
import { publishedPropertiesQuery, type PublishedProperty } from "@/shared/ui/admin/queries";

type Category = "all" | "sale" | "rent" | "student";
type Busy = "approve" | "deny";

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "all", label: "كل الأنواع" },
  { value: "sale", label: "للبيع" },
  { value: "rent", label: "للإيجار" },
  { value: "student", label: "سكن طلابي" },
];

const REASON_MAX = 500; // the server keeps the first 500 characters

const listingHref = (id: string) => `/properties/${id}`;
const openListing = (id: string) => window.open(listingHref(id), "_blank", "noopener");

/** Title cell: thumbnail and the title, which opens the listing in a new tab. */
function TitleCell({ id, title, images }: { id: string; title: string; images?: PendingProperty["images"] }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <ListingThumb images={images} alt="" />
      <MuiLink
        component={Link}
        href={listingHref(id)}
        target="_blank"
        rel="noopener"
        underline="hover"
        color="text.primary"
        sx={{ fontWeight: 600, fontSize: "0.875rem", minWidth: 0, overflowWrap: "anywhere" }}
      >
        {title || "إعلان بدون عنوان"}
      </MuiLink>
    </Box>
  );
}

function OwnerCell({ name, email }: { name?: string; email?: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
        {name || "—"}
      </Typography>
      {email && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere" }}>
          {email}
        </Typography>
      )}
    </Box>
  );
}

const ownerName = (p: PendingProperty) => p.owner?.userName || p.owner?.name || p.contactInfo?.name;

/** The moderation queue: listings waiting for review, plus the published listings for reference. */
export default function AdminPropertiesPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [tab, setTab] = useState<"pending" | "published">("pending");

  // ---------- pending (client-side: the endpoint is unpaginated) ----------
  const pending = useQuery(pendingPropertiesQuery);
  const allPending = useMemo(() => (pending.data ? flattenPending(pending.data) : []), [pending.data]);
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const table = useDataTableState({ sort: { columnId: "date", direction: "desc" } });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState<Record<string, Busy>>({});
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkReport, setBulkReport] = useState<{ ok: number; failed: { title: string; reason: string }[] } | null>(
    null,
  );
  const [denyTarget, setDenyTarget] = useState<PendingProperty | null>(null);
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allPending.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!term) return true;
      return [p.title, ownerName(p), p.owner?.email, p.location?.city, p.location?.address]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(term));
    });
  }, [allPending, category, search]);

  const setRowBusy = (id: string, state: Busy | null) =>
    setBusy((prev) => {
      const next = { ...prev };
      if (state) next[id] = state;
      else delete next[id];
      return next;
    });

  const refreshAfterModeration = async () => {
    // The row stays busy until the queue (and the sidebar badge) has refetched, so it cannot be acted on twice.
    await Promise.all([
      invalidatePending(queryClient),
      queryClient.invalidateQueries({ queryKey: ["admin", "published-properties"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
    ]);
  };

  const approveRequest = (id: string) =>
    api.put(`/properties/${id}/approve`, { status: "available", isActive: true, isApproved: true });

  const approve = async (property: PendingProperty) => {
    if (busy[property._id]) return;
    setRowBusy(property._id, "approve");
    try {
      await approveRequest(property._id);
      await refreshAfterModeration();
      setSelectedIds((ids) => ids.filter((id) => id !== property._id));
      showToast("تم اعتماد الإعلان ونشره.", "success");
    } catch (err) {
      showToast(adminErrorMessage(err, "تعذّر اعتماد الإعلان. حاول مرة أخرى."), "error");
    } finally {
      setRowBusy(property._id, null);
    }
  };

  const denyNeedsReason = Boolean(denyTarget?.contactInfo?.email);
  const reasonMissing = denyNeedsReason && !reason.trim();

  const closeDeny = () => {
    if (denyTarget && busy[denyTarget._id]) return;
    setDenyTarget(null);
    setReason("");
    setReasonTouched(false);
  };

  const deny = async () => {
    if (!denyTarget) return;
    if (reasonMissing) {
      setReasonTouched(true);
      return;
    }
    const target = denyTarget;
    setRowBusy(target._id, "deny");
    try {
      await api.delete(`/properties/${target._id}/deny`, {
        params: reason.trim() ? { reason: reason.trim().slice(0, REASON_MAX) } : undefined,
      });
      await refreshAfterModeration();
      setSelectedIds((ids) => ids.filter((id) => id !== target._id));
      setDenyTarget(null);
      setReason("");
      setReasonTouched(false);
      showToast("تم رفض الإعلان وحذفه.", "success");
    } catch (err) {
      // The dialog stays open so the admin can retry or cancel.
      showToast(adminErrorMessage(err, "تعذّر رفض الإعلان. حاول مرة أخرى."), "error");
    } finally {
      setRowBusy(target._id, null);
    }
  };

  /** Approves the selected listings one at a time and reports each one's result. */
  const bulkApprove = async (ids: string[]) => {
    const targets = allPending.filter((p) => ids.includes(p._id) && !busy[p._id]);
    if (targets.length === 0 || bulkRunning) return;
    setBulkRunning(true);
    setBulkReport(null);
    let ok = 0;
    const failed: { title: string; reason: string }[] = [];
    for (const property of targets) {
      setRowBusy(property._id, "approve");
      try {
        await approveRequest(property._id);
        ok += 1;
      } catch (err) {
        failed.push({
          title: property.title || "إعلان بدون عنوان",
          reason: adminErrorMessage(err, "تعذّر الاعتماد."),
        });
      }
    }
    await refreshAfterModeration();
    setBusy({});
    setSelectedIds([]);
    setBulkRunning(false);
    setBulkReport({ ok, failed });
    showToast(
      failed.length
        ? `اعتُمد ${formatCount(ok)} من ${formatCount(targets.length)}، وتعذّر اعتماد ${formatCount(failed.length)}.`
        : `تم اعتماد ${listingsCount(ok)}.`,
      failed.length ? "warning" : "success",
    );
  };

  const pendingColumns: DataTableColumn<PendingProperty>[] = [
    {
      id: "title",
      header: "الإعلان",
      card: "title",
      cell: (p) => <TitleCell id={p._id} title={p.title} images={p.images} />,
      sortable: true,
      sortValue: (p) => p.title,
    },
    {
      id: "owner",
      header: "المالك",
      cell: (p) => <OwnerCell name={ownerName(p)} email={p.owner?.email} />,
      hideBelow: "lg",
    },
    { id: "city", header: "المدينة", cell: (p) => p.location?.city || "—", sortable: true, sortValue: (p) => p.location?.city },
    { id: "type", header: "النوع", cell: (p) => <ListingTypeTag category={p.category} /> },
    {
      id: "price",
      header: "السعر",
      align: "end",
      cell: (p) => <Price amount={p.price} category={p.category} size="table" />,
      sortable: true,
      sortValue: (p) => p.price,
    },
    {
      id: "status",
      header: "الحالة",
      cell: (p) =>
        busy[p._id] ? (
          <Box component="span" role="status" sx={{ display: "inline-flex", alignItems: "center", gap: 1, fontSize: "0.8125rem" }}>
            <CircularProgress size={14} aria-hidden />
            {busy[p._id] === "approve" ? "جارٍ الاعتماد…" : "جارٍ الحذف…"}
          </Box>
        ) : (
          <StatusBadge status="pending" />
        ),
    },
    {
      id: "date",
      header: "تاريخ الإضافة",
      cell: (p) => formatDate(p.createdAt),
      sortable: true,
      sortValue: (p) => dateValue(p.createdAt),
      hideBelow: "xl",
    },
  ];

  // ---------- published (server-side pagination and search) ----------
  const published = useDataTableState();
  const [publishedSearch, setPublishedSearch] = useState("");
  const [debouncedPublishedSearch] = useDebounce(publishedSearch, 400);
  const publishedParams = {
    page: published.page + 1,
    limit: published.pageSize,
    search: debouncedPublishedSearch.trim(),
  };
  const publishedList = useQuery({ ...publishedPropertiesQuery(publishedParams), enabled: tab === "published" });

  const publishedColumns: DataTableColumn<PublishedProperty>[] = [
    { id: "title", header: "الإعلان", card: "title", cell: (p) => <TitleCell id={p._id} title={p.title} images={p.images} /> },
    { id: "owner", header: "المالك", cell: (p) => <OwnerCell name={p.owner?.userName} />, hideBelow: "lg" },
    { id: "city", header: "المدينة", cell: (p) => p.location?.city || "—" },
    { id: "type", header: "النوع", cell: (p) => <ListingTypeTag category={p.category} /> },
    { id: "price", header: "السعر", align: "end", cell: (p) => <Price amount={p.price} category={p.category} size="table" /> },
    { id: "status", header: "الحالة", cell: () => <StatusBadge status="approved" label="منشور" /> },
    { id: "date", header: "تاريخ الإضافة", cell: (p) => formatDate(p.createdAt), hideBelow: "xl" },
  ];

  const pendingCount = pending.data ? allPending.length : null;

  return (
    <>
      <PageHeader
        title="العقارات"
        description="راجع الإعلانات الجديدة واعتمدها قبل ظهورها في الموقع."
        breadcrumbs={[{ label: "لوحة الإدارة", href: "/admin/dashboard" }, { label: "العقارات" }]}
        actions={
          <Button component={Link} href="/admin/import-properties" variant="outlined" startIcon={<UploadFileOutlined />}>
            استيراد عقارات
          </Button>
        }
      />

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        aria-label="حالة الإعلانات"
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          value="pending"
          id="tab-pending"
          aria-controls="panel-pending"
          label={pendingCount === null ? "قيد المراجعة" : `قيد المراجعة (${formatCount(pendingCount)})`}
        />
        <Tab value="published" id="tab-published" aria-controls="panel-published" label="المنشورة" />
      </Tabs>

      {tab === "pending" ? (
        <Box role="tabpanel" id="panel-pending" aria-labelledby="tab-pending">
          {bulkReport && (
            <Alert
              severity={bulkReport.failed.length ? "warning" : "success"}
              onClose={() => setBulkReport(null)}
              sx={{ mb: 2 }}
            >
              {bulkReport.failed.length === 0 ? (
                `تم اعتماد ${listingsCount(bulkReport.ok)}.`
              ) : (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    اعتُمد {formatCount(bulkReport.ok)}، وتعذّر اعتماد {formatCount(bulkReport.failed.length)}:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, paddingInlineStart: 2.5 }}>
                    {bulkReport.failed.map((f, i) => (
                      <li key={i}>
                        <Typography variant="body2">
                          {f.title}: {f.reason}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </>
              )}
            </Alert>
          )}
          <DataTable
            label="إعلانات قيد المراجعة"
            rows={filtered}
            columns={pendingColumns}
            getRowId={(p) => p._id}
            getRowLabel={(p) => p.title}
            sort={table.sort}
            onSortChange={table.setSort}
            pagination={{
              page: table.page,
              pageSize: table.pageSize,
              onPageChange: table.setPage,
              onPageSizeChange: table.setPageSize,
            }}
            selection={{
              selectedIds,
              onChange: setSelectedIds,
              bulkActions: (ids) => (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={bulkRunning ? <CircularProgress size={14} color="inherit" aria-hidden /> : <DoneAllOutlined />}
                  disabled={bulkRunning}
                  onClick={() => bulkApprove(ids)}
                >
                  {bulkRunning ? "جارٍ الاعتماد…" : "اعتماد المحدد"}
                </Button>
              ),
            }}
            toolbar={
              <>
                <SearchField
                  label="بحث في الإعلانات"
                  value={search}
                  onChange={(value) => {
                    setSearch(value);
                    table.setPage(0);
                  }}
                />
                <TextField
                  select
                  label="نوع الإعلان"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value as Category);
                    table.setPage(0);
                  }}
                  sx={{ minWidth: 160 }}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            }
            rowActions={(p) => [
              { label: "عرض الإعلان", icon: <OpenInNewOutlined fontSize="small" />, onClick: () => openListing(p._id) },
              {
                label: "اعتماد",
                icon: <CheckCircleOutlineOutlined fontSize="small" />,
                onClick: approve,
                disabled: Boolean(busy[p._id]) || bulkRunning,
              },
              {
                label: "رفض وحذف",
                icon: <DeleteOutlineOutlined fontSize="small" />,
                destructive: true,
                onClick: (row) => setDenyTarget(row),
                disabled: Boolean(busy[p._id]) || bulkRunning,
              },
            ]}
            loading={pending.isFetching}
            error={pending.isError}
            errorTitle="تعذّر تحميل الإعلانات قيد المراجعة"
            onRetry={() => pending.refetch()}
            empty={
              allPending.length === 0
                ? {
                    icon: <TaskAltOutlined />,
                    title: "لا توجد إعلانات قيد المراجعة",
                    description: "ستظهر هنا الإعلانات الجديدة فور إضافتها.",
                  }
                : {
                    title: "لا توجد نتائج",
                    description: "جرّب كلمة بحث أخرى أو نوعًا آخر.",
                    action: (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSearch("");
                          setCategory("all");
                        }}
                      >
                        مسح عوامل التصفية
                      </Button>
                    ),
                  }
            }
          />
        </Box>
      ) : (
        <Box role="tabpanel" id="panel-published" aria-labelledby="tab-published">
          <DataTable
            label="الإعلانات المنشورة"
            mode="server"
            rows={publishedList.data?.rows ?? []}
            columns={publishedColumns}
            getRowId={(p) => p._id}
            getRowLabel={(p) => p.title}
            pagination={{
              page: published.page,
              pageSize: published.pageSize,
              onPageChange: published.setPage,
              onPageSizeChange: published.setPageSize,
              pageSizeOptions: [10, 25, 50],
              total: publishedList.data?.total ?? 0,
            }}
            toolbar={
              <SearchField
                label="بحث في الإعلانات المنشورة"
                value={publishedSearch}
                onChange={(value) => {
                  setPublishedSearch(value);
                  published.setPage(0);
                }}
              />
            }
            rowActions={(p) => [
              { label: "عرض الإعلان", icon: <OpenInNewOutlined fontSize="small" />, onClick: () => openListing(p._id) },
            ]}
            loading={publishedList.isFetching}
            error={publishedList.isError}
            errorTitle="تعذّر تحميل الإعلانات المنشورة"
            onRetry={() => publishedList.refetch()}
            empty={
              debouncedPublishedSearch.trim()
                ? { title: "لا توجد نتائج", description: "جرّب كلمة بحث أخرى." }
                : { title: "لا توجد إعلانات منشورة", description: "تظهر هنا الإعلانات بعد اعتمادها." }
            }
          />
        </Box>
      )}

      <ConfirmDialog
        open={Boolean(denyTarget)}
        title="رفض الإعلان وحذفه"
        description={
          <>
            <Typography component="span" sx={{ display: "block", mb: 1 }}>
              سيُحذف الإعلان «{denyTarget?.title}» نهائيًا مع صوره وتعليقاته واستفساراته، ويُزال من المفضلة ومن
              قائمة الوكالة. لا يمكن التراجع عن ذلك.
            </Typography>
            <Typography component="span" sx={{ display: "block" }}>
              {denyNeedsReason
                ? `سيصل إلى المعلن بريد على ${denyTarget?.contactInfo?.email} يتضمن سبب الرفض.`
                : "لا يوجد بريد للتواصل في هذا الإعلان، لذلك لن يُبلَّغ المعلن."}
            </Typography>
          </>
        }
        confirmLabel="رفض وحذف"
        loadingLabel="جارٍ الحذف…"
        loading={Boolean(denyTarget && busy[denyTarget._id])}
        onConfirm={deny}
        onClose={closeDeny}
      >
        {denyNeedsReason && (
          <TextField
            label="سبب الرفض"
            required
            fullWidth
            multiline
            minRows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            onBlur={() => setReasonTouched(true)}
            error={reasonTouched && reasonMissing}
            helperText={
              reasonTouched && reasonMissing
                ? "اكتب سبب الرفض ليصل إلى المعلن."
                : `يُرسل إلى المعلن كما تكتبه. ${REASON_MAX} حرف كحد أقصى.`
            }
            slotProps={{ htmlInput: { maxLength: REASON_MAX } }}
            sx={{ mt: 2 }}
          />
        )}
      </ConfirmDialog>
    </>
  );
}
