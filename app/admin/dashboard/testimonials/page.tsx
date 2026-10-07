"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import HighlightOffOutlined from "@mui/icons-material/HighlightOffOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { useToast } from "@/shared/provider/ToastProvider";
import { api } from "@/shared/services/api";
import DataTable, { useDataTableState, type DataTableColumn, type DataTableRowAction } from "@/shared/ui/DataTable";
import PageHeader from "@/shared/ui/PageHeader";
import StatusBadge, { testimonialStatus } from "@/shared/ui/StatusBadge";
import DetailDrawer, { DetailField } from "@/shared/ui/admin/DetailDrawer";
import { adminErrorMessage } from "@/shared/ui/admin/errors";
import { dateValue, formatDate, formatDateTime } from "@/shared/ui/admin/format";
import { testimonialsQuery, type AdminTestimonial, type TestimonialStatusValue } from "@/shared/ui/admin/queries";

type Filter = TestimonialStatusValue | "all";

const TABS: { value: Filter; label: string }[] = [
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "مقبولة" },
  { value: "rejected", label: "مرفوضة" },
  { value: "all", label: "الكل" },
];

const TYPE_LABELS: Record<AdminTestimonial["type"], string> = {
  general: "عن الموقع",
  property: "عن عقار",
  agency: "عن وكالة",
};

const EMPTY: Record<Filter, { title: string; description: string }> = {
  pending: { title: "لا توجد آراء قيد المراجعة", description: "ستظهر هنا الآراء الجديدة فور إرسالها." },
  approved: { title: "لا توجد آراء مقبولة", description: "الآراء التي تعتمدها تظهر هنا وفي الموقع." },
  rejected: { title: "لا توجد آراء مرفوضة", description: "الآراء التي ترفضها تظهر هنا ولا تُعرض في الموقع." },
  all: { title: "لا توجد آراء بعد", description: "ستظهر هنا آراء الزوار فور إرسالها." },
};

type Busy = "approved" | "rejected" | "delete";

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Filter>("pending");
  const list = useQuery(testimonialsQuery(filter));
  const table = useDataTableState({ sort: { columnId: "date", direction: "desc" } });
  const [busy, setBusy] = useState<Record<string, Busy>>({});
  const [viewing, setViewing] = useState<AdminTestimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTestimonial | null>(null);

  const setRowBusy = (id: string, state: Busy | null) =>
    setBusy((prev) => {
      const next = { ...prev };
      if (state) next[id] = state;
      else delete next[id];
      return next;
    });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });

  const setStatus = async (t: AdminTestimonial, status: "approved" | "rejected") => {
    if (busy[t._id]) return;
    setRowBusy(t._id, status);
    try {
      const { data } = await api.put(`/testimonial/${t._id}/status`, { status });
      await refresh();
      setViewing((current) => (current?._id === t._id ? { ...current, ...(data?.data ?? { status }) } : current));
      showToast(status === "approved" ? "تم اعتماد الرأي، وسيظهر في الموقع." : "تم رفض الرأي، ولن يظهر في الموقع.", "success");
    } catch (err) {
      showToast(
        adminErrorMessage(err, status === "approved" ? "تعذّر اعتماد الرأي. حاول مرة أخرى." : "تعذّر رفض الرأي. حاول مرة أخرى."),
        "error",
      );
    } finally {
      setRowBusy(t._id, null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || busy[deleteTarget._id]) return;
    const target = deleteTarget;
    setRowBusy(target._id, "delete");
    try {
      await api.delete(`/testimonial/${target._id}`);
      await Promise.all([refresh(), queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] })]);
      setDeleteTarget(null);
      setViewing((current) => (current?._id === target._id ? null : current));
      showToast("تم حذف الرأي.", "success");
    } catch (err) {
      showToast(adminErrorMessage(err, "تعذّر حذف الرأي. حاول مرة أخرى."), "error");
    } finally {
      setRowBusy(target._id, null);
    }
  };

  const statusCell = (t: AdminTestimonial) =>
    busy[t._id] ? (
      <Box component="span" role="status" sx={{ display: "inline-flex", alignItems: "center", gap: 1, fontSize: "0.8125rem" }}>
        <CircularProgress size={14} aria-hidden />
        {busy[t._id] === "delete" ? "جارٍ الحذف…" : "جارٍ الحفظ…"}
      </Box>
    ) : (
      <StatusBadge status={testimonialStatus(t.status)} />
    );

  const columns: DataTableColumn<AdminTestimonial>[] = [
    {
      id: "name",
      header: "صاحب الرأي",
      card: "title",
      sortable: true,
      sortValue: (t) => t.name,
      cell: (t) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
            {t.name}
          </Typography>
          {t.role && (
            <Typography variant="caption" color="text.secondary">
              {t.role}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "text",
      header: "الرأي",
      cell: (t) => (
        <Typography
          variant="body2"
          sx={{ fontSize: "0.8125rem", maxWidth: 460, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {t.text}
        </Typography>
      ),
    },
    { id: "type", header: "النوع", cell: (t) => TYPE_LABELS[t.type] ?? "—", hideBelow: "lg" },
    { id: "status", header: "الحالة", cell: statusCell },
    {
      id: "date",
      header: "التاريخ",
      cell: (t) => formatDate(t.createdAt),
      sortable: true,
      sortValue: (t) => dateValue(t.createdAt),
      hideBelow: "lg",
    },
  ];

  const actionsFor = (t: AdminTestimonial): DataTableRowAction<AdminTestimonial>[] => {
    const disabled = Boolean(busy[t._id]);
    const actions: DataTableRowAction<AdminTestimonial>[] = [
      { label: "عرض الرأي", icon: <VisibilityOutlined fontSize="small" />, onClick: setViewing },
    ];
    if (t.status !== "approved")
      actions.push({ label: "اعتماد", icon: <CheckCircleOutlineOutlined fontSize="small" />, onClick: (row) => setStatus(row, "approved"), disabled });
    if (t.status !== "rejected")
      actions.push({ label: "رفض", icon: <HighlightOffOutlined fontSize="small" />, onClick: (row) => setStatus(row, "rejected"), disabled });
    actions.push({ label: "حذف", icon: <DeleteOutlineOutlined fontSize="small" />, destructive: true, onClick: setDeleteTarget, disabled });
    return actions;
  };

  return (
    <>
      <PageHeader
        title="آراء العملاء"
        description="راجع آراء الزوار قبل نشرها. الآراء المقبولة فقط تظهر في الموقع."
        breadcrumbs={[{ label: "لوحة الإدارة", href: "/admin/dashboard" }, { label: "آراء العملاء" }]}
      />

      <Tabs
        value={filter}
        onChange={(_, value) => {
          setFilter(value);
          table.setPage(0);
        }}
        aria-label="حالة الآراء"
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      <DataTable
        label={`آراء العملاء: ${TABS.find((tab) => tab.value === filter)?.label}`}
        rows={list.data ?? []}
        columns={columns}
        getRowId={(t) => t._id}
        getRowLabel={(t) => t.name}
        onRowClick={setViewing}
        sort={table.sort}
        onSortChange={table.setSort}
        pagination={{
          page: table.page,
          pageSize: table.pageSize,
          onPageChange: table.setPage,
          onPageSizeChange: table.setPageSize,
        }}
        rowActions={actionsFor}
        loading={list.isFetching}
        error={list.isError}
        errorTitle="تعذّر تحميل الآراء"
        onRetry={() => list.refetch()}
        empty={{ icon: <RateReviewOutlined />, ...EMPTY[filter] }}
      />

      <DetailDrawer
        open={Boolean(viewing)}
        title="تفاصيل الرأي"
        onClose={() => setViewing(null)}
        actions={
          viewing && (
            <>
              {viewing.status !== "approved" && (
                <Button
                  variant="contained"
                  startIcon={<CheckCircleOutlineOutlined />}
                  disabled={Boolean(busy[viewing._id])}
                  onClick={() => setStatus(viewing, "approved")}
                >
                  اعتماد
                </Button>
              )}
              {viewing.status !== "rejected" && (
                <Button
                  variant="outlined"
                  startIcon={<HighlightOffOutlined />}
                  disabled={Boolean(busy[viewing._id])}
                  onClick={() => setStatus(viewing, "rejected")}
                >
                  رفض
                </Button>
              )}
              <Button
                color="error"
                startIcon={<DeleteOutlineOutlined />}
                disabled={Boolean(busy[viewing._id])}
                onClick={() => setDeleteTarget(viewing)}
                sx={{ marginInlineStart: "auto" }}
              >
                حذف
              </Button>
            </>
          )
        }
      >
        {viewing && (
          <Box component="dl" sx={{ m: 0 }}>
            <DetailField label="الحالة">{statusCell(viewing)}</DetailField>
            <DetailField label="الاسم">{viewing.name}</DetailField>
            {viewing.role && <DetailField label="الصفة">{viewing.role}</DetailField>}
            <DetailField label="النوع">{TYPE_LABELS[viewing.type] ?? "—"}</DetailField>
            <DetailField label="تاريخ الإرسال">{formatDateTime(viewing.createdAt)}</DetailField>
            <DetailField label="نص الرأي">{viewing.text}</DetailField>
          </Box>
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الرأي"
        description={`سيُحذف رأي «${deleteTarget?.name ?? ""}» نهائيًا، ويختفي من الموقع إن كان مقبولًا. لا يمكن التراجع عن ذلك.`}
        confirmLabel="حذف"
        loadingLabel="جارٍ الحذف…"
        loading={Boolean(deleteTarget && busy[deleteTarget._id] === "delete")}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!(deleteTarget && busy[deleteTarget._id])) setDeleteTarget(null);
        }}
      />
    </>
  );
}
