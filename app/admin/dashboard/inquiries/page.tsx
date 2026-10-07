"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import MuiLink from "@mui/material/Link";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import MailOutlineOutlined from "@mui/icons-material/MailOutlineOutlined";
import MarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import PropertyInquiriesSection from "@/shared/components/admin/PropertyInquiriesSection";
import { useToast } from "@/shared/provider/ToastProvider";
import { api } from "@/shared/services/api";
import DataTable, { useDataTableState, type DataTableColumn } from "@/shared/ui/DataTable";
import PageHeader from "@/shared/ui/PageHeader";
import StatusBadge from "@/shared/ui/StatusBadge";
import DetailDrawer, { DetailField } from "@/shared/ui/admin/DetailDrawer";
import SearchField from "@/shared/ui/admin/SearchField";
import { adminErrorMessage } from "@/shared/ui/admin/errors";
import { dateValue, formatDate, formatDateTime } from "@/shared/ui/admin/format";
import { contactsQuery, type ContactMessage, type ContactStatus } from "@/shared/ui/admin/queries";
import { CONTACT_STATUS } from "@/shared/ui/admin/statuses";

const STATUS_FILTERS: { value: ContactStatus | "all"; label: string }[] = [
  { value: "all", label: "كل الحالات" },
  { value: "pending", label: CONTACT_STATUS.pending.label },
  { value: "in-progress", label: CONTACT_STATUS["in-progress"].label },
  { value: "closed", label: CONTACT_STATUS.closed.label },
];

const STATUS_VALUES = STATUS_FILTERS.filter((f) => f.value !== "all") as { value: ContactStatus; label: string }[];

/** Messages sent from the contact page (contact module, unpaginated: filtered and paged here). */
function ContactMessagesSection() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const messages = useQuery(contactsQuery);
  const table = useDataTableState({ sort: { columnId: "date", direction: "desc" } });
  const [status, setStatus] = useState<ContactStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const all = useMemo(() => messages.data ?? [], [messages.data]);
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (!term) return true;
      return [m.name, m.email, m.subject, m.message].some((text) => text?.toLowerCase().includes(term));
    });
  }, [all, status, search]);
  const viewing = all.find((m) => m._id === viewingId) ?? null;

  const refresh = () => queryClient.invalidateQueries({ queryKey: contactsQuery.queryKey });

  const changeStatus = async (message: ContactMessage, next: ContactStatus) => {
    if (savingStatus || message.status === next) return;
    setSavingStatus(true);
    try {
      await api.put(`/contact/update-contact-status/${message._id}`, { status: next });
      await refresh();
      showToast("تم تحديث حالة الرسالة.", "success");
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
      await api.delete(`/contact/delete-contact/${deleteTarget._id}`);
      await Promise.all([refresh(), queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] })]);
      if (viewingId === deleteTarget._id) setViewingId(null);
      setDeleteTarget(null);
      showToast("تم حذف الرسالة.", "success");
    } catch (err) {
      showToast(adminErrorMessage(err, "تعذّر حذف الرسالة. حاول مرة أخرى."), "error");
    } finally {
      setDeleting(false);
    }
  };

  const columns: DataTableColumn<ContactMessage>[] = [
    {
      id: "sender",
      header: "المرسل",
      card: "title",
      sortable: true,
      sortValue: (m) => m.name,
      cell: (m) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
            {m.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere" }}>
            {m.email}
          </Typography>
        </Box>
      ),
    },
    {
      id: "subject",
      header: "الموضوع",
      cell: (m) => (
        <Typography variant="body2" sx={{ fontSize: "0.8125rem", maxWidth: 360, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {m.subject}
        </Typography>
      ),
    },
    { id: "status", header: "الحالة", cell: (m) => <StatusBadge {...(CONTACT_STATUS[m.status] ?? CONTACT_STATUS.pending)} /> },
    {
      id: "date",
      header: "التاريخ",
      cell: (m) => formatDate(m.createdAt),
      sortable: true,
      sortValue: (m) => dateValue(m.createdAt),
      hideBelow: "lg",
    },
  ];

  return (
    <>
      <DataTable
        label="رسائل التواصل"
        rows={rows}
        columns={columns}
        getRowId={(m) => m._id}
        getRowLabel={(m) => m.name}
        onRowClick={(m) => setViewingId(m._id)}
        sort={table.sort}
        onSortChange={table.setSort}
        pagination={{
          page: table.page,
          pageSize: table.pageSize,
          onPageChange: table.setPage,
          onPageSizeChange: table.setPageSize,
        }}
        toolbar={
          <>
            <SearchField
              label="بحث في الرسائل"
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
                setStatus(event.target.value as ContactStatus | "all");
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
          { label: "عرض الرسالة", icon: <VisibilityOutlined fontSize="small" />, onClick: (m) => setViewingId(m._id) },
          { label: "حذف", icon: <DeleteOutlineOutlined fontSize="small" />, destructive: true, onClick: setDeleteTarget },
        ]}
        loading={messages.isFetching}
        error={messages.isError}
        errorTitle="تعذّر تحميل رسائل التواصل"
        onRetry={() => messages.refetch()}
        empty={
          all.length === 0
            ? { icon: <MarkEmailReadOutlined />, title: "لا توجد رسائل", description: "تظهر هنا الرسائل المرسلة من صفحة «تواصل معنا»." }
            : { title: "لا توجد رسائل مطابقة", description: "جرّب كلمة بحث أخرى أو حالة أخرى." }
        }
      />

      <DetailDrawer
        open={Boolean(viewing)}
        title="تفاصيل الرسالة"
        onClose={() => setViewingId(null)}
        actions={
          viewing && (
            <>
              <Button
                variant="contained"
                component="a"
                href={`mailto:${viewing.email}?subject=${encodeURIComponent(`رد: ${viewing.subject}`)}`}
                startIcon={<MailOutlineOutlined />}
              >
                الرد بالبريد
              </Button>
              <Button color="error" startIcon={<DeleteOutlineOutlined />} onClick={() => setDeleteTarget(viewing)} sx={{ marginInlineStart: "auto" }}>
                حذف
              </Button>
            </>
          )
        }
      >
        {viewing && (
          <>
            <TextField
              select
              fullWidth
              label="الحالة"
              value={viewing.status}
              disabled={savingStatus}
              onChange={(event) => changeStatus(viewing, event.target.value as ContactStatus)}
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
              <DetailField label="الاسم">{viewing.name}</DetailField>
              <DetailField label="البريد الإلكتروني">
                <MuiLink href={`mailto:${viewing.email}`}>{viewing.email}</MuiLink>
              </DetailField>
              <DetailField label="تاريخ الإرسال">{formatDateTime(viewing.createdAt)}</DetailField>
              <DetailField label="الموضوع">{viewing.subject}</DetailField>
              <DetailField label="الرسالة">{viewing.message}</DetailField>
            </Box>
          </>
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الرسالة"
        description={`ستُحذف رسالة «${deleteTarget?.name ?? ""}» نهائيًا، ولا يمكن التراجع عن ذلك.`}
        confirmLabel="حذف"
        loadingLabel="جارٍ الحذف…"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </>
  );
}

export default function AdminInquiriesPage() {
  const [tab, setTab] = useState<"contact" | "property">("contact");
  return (
    <>
      <PageHeader
        title="الاستفسارات"
        description="رسائل صفحة «تواصل معنا» وأسئلة الزوار عن الإعلانات، مع حالة متابعة كل منها."
        breadcrumbs={[{ label: "لوحة الإدارة", href: "/admin/dashboard" }, { label: "الاستفسارات" }]}
      />
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        aria-label="نوع الاستفسارات"
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab value="contact" id="tab-contact" aria-controls="panel-contact" label="رسائل التواصل" />
        <Tab value="property" id="tab-property" aria-controls="panel-property" label="استفسارات العقارات" />
      </Tabs>
      <Box role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "contact" ? <ContactMessagesSection /> : <PropertyInquiriesSection />}
      </Box>
    </>
  );
}
