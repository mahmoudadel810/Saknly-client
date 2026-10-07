"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import AddOutlined from "@mui/icons-material/AddOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import StarOutlineOutlined from "@mui/icons-material/StarOutlineOutlined";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { useToast } from "@/shared/provider/ToastProvider";
import { api } from "@/shared/services/api";
import DataTable, { useDataTableState, type DataTableColumn } from "@/shared/ui/DataTable";
import PageHeader from "@/shared/ui/PageHeader";
import AgencyFormDialog from "@/shared/ui/admin/AgencyFormDialog";
import SearchField from "@/shared/ui/admin/SearchField";
import { adminErrorMessage } from "@/shared/ui/admin/errors";
import { formatDate } from "@/shared/ui/admin/format";
import { agenciesQuery, type AdminAgency } from "@/shared/ui/admin/queries";

export default function AdminAgenciesPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const table = useDataTableState({ pageSize: 10 });
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const params = { page: table.page + 1, limit: table.pageSize, search: debouncedSearch.trim() };
  const agencies = useQuery(agenciesQuery(params));

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAgency | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAgency | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingIds, setTogglingIds] = useState<string[]>([]);

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "agencies"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
    ]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (agency: AdminAgency) => {
    setEditing(agency);
    setFormOpen(true);
  };

  const toggleFeatured = async (agency: AdminAgency) => {
    if (togglingIds.includes(agency._id)) return;
    const next = !agency.isFeatured;
    setTogglingIds((ids) => [...ids, agency._id]);
    try {
      await api.patch(`/agencies/${agency._id}/feature`, { isFeatured: next });
      await queryClient.invalidateQueries({ queryKey: ["admin", "agencies"] });
      showToast(next ? "أصبحت الوكالة مميزة." : "أُلغي تمييز الوكالة.", "success");
    } catch (err) {
      showToast(adminErrorMessage(err, "تعذّر تغيير تمييز الوكالة. حاول مرة أخرى."), "error");
    } finally {
      setTogglingIds((ids) => ids.filter((id) => id !== agency._id));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/agencies/${deleteTarget._id}`);
      await refresh();
      setDeleteTarget(null);
      showToast("تم حذف الوكالة.", "success");
    } catch (err) {
      // The dialog stays open so the admin can retry or cancel.
      showToast(adminErrorMessage(err, "تعذّر حذف الوكالة. حاول مرة أخرى."), "error");
    } finally {
      setDeleting(false);
    }
  };

  const columns: DataTableColumn<AdminAgency>[] = [
    {
      id: "name",
      header: "الوكالة",
      card: "title",
      cell: (a) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Avatar
            src={a.logo?.url}
            alt=""
            variant="rounded"
            sx={{ width: 40, height: 40, borderRadius: "6px", bgcolor: "var(--c-bg)", color: "var(--c-muted)", border: 1, borderColor: "divider" }}
          >
            <BusinessOutlined fontSize="small" />
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem", overflowWrap: "anywhere" }}>
            {a.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: "description",
      header: "الوصف",
      hideBelow: "lg",
      cell: (a) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.8125rem", maxWidth: 420, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {a.description || "—"}
        </Typography>
      ),
    },
    {
      id: "featured",
      header: "مميزة",
      cell: (a) => (
        <Switch
          size="small"
          checked={a.isFeatured}
          disabled={togglingIds.includes(a._id)}
          onClick={(event) => event.stopPropagation()}
          onChange={() => toggleFeatured(a)}
          slotProps={{ input: { "aria-label": `وكالة مميزة: ${a.name}` } }}
        />
      ),
    },
    { id: "created", header: "تاريخ الإضافة", cell: (a) => formatDate(a.createdAt), hideBelow: "lg" },
  ];

  return (
    <>
      <PageHeader
        title="الوكالات"
        description="أضف الوكالات العقارية وعدّل بياناتها، واختر ما يظهر منها في الصفحة الرئيسية."
        breadcrumbs={[{ label: "لوحة الإدارة", href: "/admin/dashboard" }, { label: "الوكالات" }]}
        actions={
          <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>
            إضافة وكالة
          </Button>
        }
      />

      <DataTable
        label="الوكالات"
        mode="server"
        rows={agencies.data?.rows ?? []}
        columns={columns}
        getRowId={(a) => a._id}
        getRowLabel={(a) => a.name}
        pagination={{
          page: table.page,
          pageSize: table.pageSize,
          onPageChange: table.setPage,
          onPageSizeChange: table.setPageSize,
          pageSizeOptions: [10, 25, 50],
          total: agencies.data?.total ?? 0,
        }}
        toolbar={
          <SearchField
            label="بحث باسم الوكالة"
            value={search}
            onChange={(value) => {
              setSearch(value);
              table.setPage(0);
            }}
          />
        }
        rowActions={(a) => [
          { label: "تعديل", icon: <EditOutlined fontSize="small" />, onClick: openEdit },
          {
            label: a.isFeatured ? "إلغاء التمييز" : "تمييز الوكالة",
            icon: <StarOutlineOutlined fontSize="small" />,
            onClick: toggleFeatured,
            disabled: togglingIds.includes(a._id),
          },
          {
            label: "عرض صفحة الوكالة",
            icon: <OpenInNewOutlined fontSize="small" />,
            onClick: (row) => window.open(`/agencies/${row._id}`, "_blank", "noopener"),
          },
          { label: "حذف", icon: <DeleteOutlineOutlined fontSize="small" />, destructive: true, onClick: setDeleteTarget },
        ]}
        loading={agencies.isFetching}
        error={agencies.isError}
        errorTitle="تعذّر تحميل الوكالات"
        onRetry={() => agencies.refetch()}
        empty={
          debouncedSearch.trim()
            ? { title: "لا توجد وكالات مطابقة", description: "جرّب اسمًا آخر." }
            : {
                icon: <BusinessOutlined />,
                title: "لا توجد وكالات بعد",
                description: "أضف أول وكالة لتظهر في الموقع.",
                action: (
                  <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>
                    إضافة وكالة
                  </Button>
                ),
              }
        }
      />

      <AgencyFormDialog
        open={formOpen}
        agency={editing}
        onClose={() => setFormOpen(false)}
        onSaved={async (_, created) => {
          setFormOpen(false);
          showToast(created ? "تمت إضافة الوكالة." : "تم حفظ التعديلات.", "success");
          await refresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الوكالة"
        description={`ستُحذف وكالة «${deleteTarget?.name ?? ""}» وشعارها نهائيًا. تبقى عقاراتها كما هي، لكن دون ربطها بأي وكالة. لا يمكن التراجع عن ذلك.`}
        confirmLabel="حذف"
        loadingLabel="جارٍ الحذف…"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </>
  );
}
