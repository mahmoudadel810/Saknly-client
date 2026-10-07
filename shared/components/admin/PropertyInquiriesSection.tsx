"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import MailOutlineOutlined from "@mui/icons-material/MailOutlineOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { useToast } from "@/shared/provider/ToastProvider";
import { api } from "@/shared/services/api";
import DataTable, { useDataTableState, type DataTableColumn } from "@/shared/ui/DataTable";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import StatusBadge from "@/shared/ui/StatusBadge";
import { visuallyHidden } from "@/shared/ui/a11y";
import DetailDrawer, { DetailField } from "@/shared/ui/admin/DetailDrawer";
import SearchField from "@/shared/ui/admin/SearchField";
import { adminErrorMessage } from "@/shared/ui/admin/errors";
import { formatDate, formatDateTime } from "@/shared/ui/admin/format";
import { propertyInquiriesQuery, type InquiryStatus, type PropertyInquiry } from "@/shared/ui/admin/queries";
import { INQUIRY_STATUS } from "@/shared/ui/admin/statuses";

const STATUS_FILTERS: { value: InquiryStatus | "all"; label: string }[] = [
  { value: "all", label: "كل الحالات" },
  { value: "new", label: INQUIRY_STATUS.new.label },
  { value: "in-progress", label: INQUIRY_STATUS["in-progress"].label },
  { value: "responded", label: INQUIRY_STATUS.responded.label },
  { value: "closed", label: INQUIRY_STATUS.closed.label },
];

const STATUS_VALUES = STATUS_FILTERS.filter((f) => f.value !== "all") as { value: InquiryStatus; label: string }[];

/** Questions buyers sent about a listing (property-inquiry module): server-paginated, filterable, with details. */
export default function PropertyInquiriesSection() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const table = useDataTableState({ pageSize: 10 });
  const [status, setStatus] = useState<InquiryStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const params = { page: table.page + 1, limit: table.pageSize, status, search: debouncedSearch.trim() };
  const list = useQuery(propertyInquiriesQuery(params));

  const [openId, setOpenId] = useState<string | null>(null);
  const openedUnread = useRef(false);
  const openInquiry = (q: PropertyInquiry) => {
    openedUnread.current = !q.isRead;
    setOpenId(q._id);
  };
  // Opening an inquiry through this endpoint marks it as read on the server; the list then drops its marker.
  const detail = useQuery({
    queryKey: ["admin", "property-inquiry", openId],
    enabled: Boolean(openId),
    queryFn: async (): Promise<PropertyInquiry> => {
      const { data } = await api.get(`/property-inquiry/get-property-inquiry-by-id/${openId}`);
      if (openedUnread.current) {
        openedUnread.current = false;
        queryClient.invalidateQueries({ queryKey: ["admin", "property-inquiries"] });
      }
      return data?.data;
    },
  });

  const [savingStatus, setSavingStatus] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PropertyInquiry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refreshList = () => queryClient.invalidateQueries({ queryKey: ["admin", "property-inquiries"] });

  const changeStatus = async (inquiry: PropertyInquiry, next: InquiryStatus) => {
    if (savingStatus || inquiry.status === next) return;
    setSavingStatus(true);
    try {
      await api.put(`/property-inquiry/update-property-inquiry-status/${inquiry._id}`, { status: next });
      queryClient.setQueryData<PropertyInquiry>(["admin", "property-inquiry", inquiry._id], (prev) =>
        prev ? { ...prev, status: next } : prev,
      );
      await refreshList();
      showToast("تم تحديث حالة الاستفسار.", "success");
    } catch (err) {
      showToast(adminErrorMessage(err, "تعذّر تحديث الحالة. حاول مرة أخرى."), "error");
    } finally {
      setSavingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/property-inquiry/delete-property-inquiry/${deleteTarget._id}`);
      await Promise.all([refreshList(), queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] })]);
      if (openId === deleteTarget._id) setOpenId(null);
      setDeleteTarget(null);
      showToast("تم حذف الاستفسار.", "success");
    } catch (err) {
      showToast(adminErrorMessage(err, "تعذّر حذف الاستفسار. حاول مرة أخرى."), "error");
    } finally {
      setDeleting(false);
    }
  };

  const columns: DataTableColumn<PropertyInquiry>[] = [
    {
      id: "sender",
      header: "المرسل",
      card: "title",
      cell: (q) => (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, minWidth: 0 }}>
          {!q.isRead && (
            <>
              <Box aria-hidden sx={{ width: 8, height: 8, mt: 0.75, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
              <Box component="span" sx={visuallyHidden}>
                غير مقروء:
              </Box>
            </>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: q.isRead ? 500 : 700, fontSize: "0.875rem" }}>
              {q.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere" }}>
              {q.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "property",
      header: "العقار",
      cell: (q) =>
        q.property ? (
          <MuiLink
            component={Link}
            href={`/properties/${q.property._id}`}
            target="_blank"
            rel="noopener"
            underline="hover"
            onClick={(event: React.MouseEvent) => event.stopPropagation()}
            sx={{ fontSize: "0.8125rem" }}
          >
            {q.property.title || "عرض العقار"}
          </MuiLink>
        ) : (
          <Typography variant="caption" color="text.secondary">
            عقار محذوف
          </Typography>
        ),
    },
    {
      id: "message",
      header: "الرسالة",
      hideBelow: "xl",
      cell: (q) => (
        <Typography variant="body2" sx={{ fontSize: "0.8125rem", maxWidth: 360, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {q.message}
        </Typography>
      ),
    },
    { id: "status", header: "الحالة", cell: (q) => <StatusBadge {...(INQUIRY_STATUS[q.status] ?? INQUIRY_STATUS.new)} /> },
    { id: "date", header: "التاريخ", cell: (q) => formatDate(q.createdAt), hideBelow: "lg" },
  ];

  const inquiry = detail.data;

  return (
    <>
      <DataTable
        label="استفسارات العقارات"
        mode="server"
        rows={list.data?.rows ?? []}
        columns={columns}
        getRowId={(q) => q._id}
        getRowLabel={(q) => q.name}
        onRowClick={openInquiry}
        pagination={{
          page: table.page,
          pageSize: table.pageSize,
          onPageChange: table.setPage,
          onPageSizeChange: table.setPageSize,
          pageSizeOptions: [10, 25, 50],
          total: list.data?.total ?? 0,
        }}
        toolbar={
          <>
            <SearchField
              label="بحث بالاسم أو البريد أو الرسالة"
              value={search}
              onChange={(value) => {
                setSearch(value);
                table.setPage(0);
              }}
            />
            <TextField
              select
              label="الحالة"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as InquiryStatus | "all");
                table.setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              {STATUS_FILTERS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </>
        }
        rowActions={() => [
          { label: "عرض التفاصيل", icon: <VisibilityOutlined fontSize="small" />, onClick: openInquiry },
          { label: "حذف", icon: <DeleteOutlineOutlined fontSize="small" />, destructive: true, onClick: setDeleteTarget },
        ]}
        loading={list.isFetching}
        error={list.isError}
        errorTitle="تعذّر تحميل استفسارات العقارات"
        onRetry={() => list.refetch()}
        empty={
          debouncedSearch.trim() || status !== "all"
            ? { title: "لا توجد استفسارات مطابقة", description: "جرّب كلمة بحث أخرى أو حالة أخرى." }
            : { icon: <ForumOutlined />, title: "لا توجد استفسارات عن العقارات", description: "تظهر هنا أسئلة الزوار عن الإعلانات." }
        }
      />

      <DetailDrawer
        open={Boolean(openId)}
        title="تفاصيل الاستفسار"
        onClose={() => setOpenId(null)}
        actions={
          inquiry && (
            <>
              <Button variant="contained" component="a" href={`mailto:${inquiry.email}`} startIcon={<MailOutlineOutlined />}>
                الرد بالبريد
              </Button>
              <Button color="error" startIcon={<DeleteOutlineOutlined />} onClick={() => setDeleteTarget(inquiry)} sx={{ marginInlineStart: "auto" }}>
                حذف
              </Button>
            </>
          )
        }
      >
        {detail.isLoading ? (
          <LoadingState compact />
        ) : detail.isError || !inquiry ? (
          <ErrorState compact title="تعذّر تحميل الاستفسار" onRetry={() => detail.refetch()} retrying={detail.isFetching} />
        ) : (
          <>
            <TextField
              select
              fullWidth
              label="الحالة"
              value={inquiry.status}
              disabled={savingStatus}
              onChange={(event) => changeStatus(inquiry, event.target.value as InquiryStatus)}
              helperText={savingStatus ? "جارٍ الحفظ…" : undefined}
              sx={{ mb: 3 }}
            >
              {STATUS_VALUES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Box component="dl" sx={{ m: 0 }}>
              <DetailField label="الاسم">{inquiry.name}</DetailField>
              <DetailField label="البريد الإلكتروني">
                <MuiLink href={`mailto:${inquiry.email}`}>{inquiry.email}</MuiLink>
              </DetailField>
              <DetailField label="الهاتف">
                <MuiLink href={`tel:${inquiry.phone}`} dir="ltr">
                  {inquiry.phone}
                </MuiLink>
              </DetailField>
              <DetailField label="العقار">
                {inquiry.property ? (
                  <MuiLink component={Link} href={`/properties/${inquiry.property._id}`} target="_blank" rel="noopener">
                    {inquiry.property.title || "عرض العقار"}
                  </MuiLink>
                ) : (
                  "عقار محذوف"
                )}
              </DetailField>
              {inquiry.agent && (
                <DetailField label="صاحب الإعلان">
                  {[inquiry.agent.userName, inquiry.agent.email].filter(Boolean).join("، ")}
                </DetailField>
              )}
              <DetailField label="تاريخ الإرسال">{formatDateTime(inquiry.createdAt)}</DetailField>
              <DetailField label="الرسالة">{inquiry.message}</DetailField>
            </Box>
          </>
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الاستفسار"
        description={`سيُحذف استفسار «${deleteTarget?.name ?? ""}» نهائيًا، ولا يمكن التراجع عن ذلك.`}
        confirmLabel="حذف"
        loadingLabel="جارٍ الحذف…"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </>
  );
}
