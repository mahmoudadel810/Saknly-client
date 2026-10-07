"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import BlockOutlined from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import PersonSearchOutlined from "@mui/icons-material/PersonSearchOutlined";
import RemoveModeratorOutlined from "@mui/icons-material/RemoveModeratorOutlined";
import { useAuth } from "@/app/context/AuthContext";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { useToast } from "@/shared/provider/ToastProvider";
import { api } from "@/shared/services/api";
import DataTable, { useDataTableState, type DataTableColumn, type DataTableRowAction } from "@/shared/ui/DataTable";
import PageHeader from "@/shared/ui/PageHeader";
import StatusBadge from "@/shared/ui/StatusBadge";
import AdminGuard from "@/shared/ui/admin/AdminGuard";
import SearchField from "@/shared/ui/admin/SearchField";
import { adminErrorMessage } from "@/shared/ui/admin/errors";
import { formatDate } from "@/shared/ui/admin/format";
import { usersQuery, type AdminUser } from "@/shared/ui/admin/queries";
import { userStatusBadge } from "@/shared/ui/admin/statuses";

type ActionKind = "promote" | "demote" | "activate" | "deactivate" | "delete";

const displayName = (u: AdminUser) => [u.firstName, u.lastName].filter(Boolean).join(" ") || u.userName;

/** Wording and request for each action; descriptions state what the server actually does. */
const ACTIONS: Record<
  ActionKind,
  {
    title: string;
    confirm: string;
    loading: string;
    success: string;
    failure: string;
    destructive: boolean;
    description: (u: AdminUser) => string;
    request: (u: AdminUser) => Promise<unknown>;
  }
> = {
  promote: {
    title: "منح صلاحية الإشراف",
    confirm: "منح الصلاحية",
    loading: "جارٍ الحفظ…",
    success: "تم منح صلاحية الإشراف.",
    failure: "تعذّر منح صلاحية الإشراف.",
    destructive: false,
    description: (u) =>
      `سيتمكن ${displayName(u)} من دخول لوحة الإدارة، واعتماد الإعلانات ورفضها، وإدارة المستخدمين والوكالات.`,
    request: (u) => api.put(`/users/update-user/${u._id}`, { role: "admin" }),
  },
  demote: {
    title: "إلغاء صلاحية الإشراف",
    confirm: "إلغاء الصلاحية",
    loading: "جارٍ الحفظ…",
    success: "تم إلغاء صلاحية الإشراف.",
    failure: "تعذّر إلغاء صلاحية الإشراف.",
    destructive: true,
    description: (u) => `سيعود ${displayName(u)} مستخدمًا عاديًا ولن يتمكن من دخول لوحة الإدارة.`,
    request: (u) => api.put(`/users/update-user/${u._id}`, { role: "user" }),
  },
  activate: {
    title: "تفعيل الحساب",
    confirm: "تفعيل",
    loading: "جارٍ التفعيل…",
    success: "تم تفعيل الحساب.",
    failure: "تعذّر تفعيل الحساب.",
    destructive: false,
    description: (u) => `سيتمكن ${displayName(u)} من تسجيل الدخول واستخدام حسابه.`,
    request: (u) => api.put(`/users/update-user/${u._id}`, { status: "active" }),
  },
  deactivate: {
    title: "إيقاف الحساب",
    confirm: "إيقاف",
    loading: "جارٍ الإيقاف…",
    success: "تم إيقاف الحساب.",
    failure: "تعذّر إيقاف الحساب.",
    destructive: true,
    description: (u) =>
      `لن يتمكن ${displayName(u)} من تسجيل الدخول أو استخدام حسابه حتى تفعّله من جديد. تبقى إعلاناته كما هي.`,
    request: (u) => api.put(`/users/update-user/${u._id}`, { status: "in-active" }),
  },
  delete: {
    title: "حذف المستخدم",
    confirm: "حذف",
    loading: "جارٍ الحذف…",
    success: "تم حذف المستخدم.",
    failure: "تعذّر حذف المستخدم.",
    destructive: true,
    description: (u) =>
      `سيُحذف حساب ${displayName(u)} نهائيًا مع تعليقاته، وتُخفى إعلاناته من الموقع دون حذفها. لا يمكن التراجع عن ذلك.`,
    request: (u) => api.delete(`/users/delete-user/${u._id}`),
  },
};

function UserCell({ user }: { user: AdminUser }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <Avatar aria-hidden sx={{ width: 32, height: 32, fontSize: "0.875rem", bgcolor: "var(--c-primary-soft)", color: "primary.main" }}>
        {displayName(user).charAt(0)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
          {displayName(user)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere" }}>
          {user.email}
        </Typography>
      </Box>
    </Box>
  );
}

function RoleCell({ role }: { role: AdminUser["role"] }) {
  const admin = role === "admin";
  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "0.8125rem", color: admin ? "primary.main" : "text.secondary" }}
    >
      {admin ? <AdminPanelSettingsOutlined sx={{ fontSize: 18 }} aria-hidden /> : <PersonOutlineOutlined sx={{ fontSize: 18 }} aria-hidden />}
      {admin ? "مشرف" : "مستخدم"}
    </Box>
  );
}

function UsersTable() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const table = useDataTableState({ pageSize: 10 });
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const params = { page: table.page + 1, limit: table.pageSize, search: debouncedSearch.trim() };
  const users = useQuery(usersQuery(params));

  const [pending, setPending] = useState<{ kind: ActionKind; user: AdminUser } | null>(null);
  const [running, setRunning] = useState(false);
  const [actionError, setActionError] = useState("");

  const open = (kind: ActionKind, user: AdminUser) => {
    setActionError("");
    setPending({ kind, user });
  };
  const close = () => {
    if (running) return;
    setPending(null);
    setActionError("");
  };

  const run = async () => {
    if (!pending || running) return;
    const action = ACTIONS[pending.kind];
    setRunning(true);
    setActionError("");
    try {
      await action.request(pending.user);
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      if (pending.kind === "delete") queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      setPending(null);
      showToast(action.success, "success");
    } catch (err) {
      // Shown in the dialog: a refusal (409: own account, last active admin) needs to be read, not missed.
      setActionError(adminErrorMessage(err, `${action.failure} حاول مرة أخرى.`));
    } finally {
      setRunning(false);
    }
  };

  const columns: DataTableColumn<AdminUser>[] = [
    { id: "user", header: "المستخدم", card: "title", cell: (u) => <UserCell user={u} /> },
    { id: "phone", header: "الهاتف", cell: (u) => <span dir="ltr">{u.phone || "—"}</span>, hideBelow: "lg" },
    { id: "role", header: "الدور", cell: (u) => <RoleCell role={u.role} /> },
    { id: "status", header: "الحالة", cell: (u) => <StatusBadge {...userStatusBadge(u.status)} /> },
    { id: "joined", header: "تاريخ التسجيل", cell: (u) => formatDate(u.createdAt), hideBelow: "lg" },
    { id: "lastLogin", header: "آخر دخول", cell: (u) => formatDate(u.lastLoginAt), hideBelow: "xl" },
  ];

  const rowActions = (u: AdminUser): DataTableRowAction<AdminUser>[] => {
    const isMe = u._id === me?._id;
    const actions: DataTableRowAction<AdminUser>[] = [];
    actions.push(
      u.role === "admin"
        ? { label: "إلغاء صلاحية الإشراف", icon: <RemoveModeratorOutlined fontSize="small" />, onClick: (row) => open("demote", row), disabled: isMe }
        : { label: "منح صلاحية الإشراف", icon: <AdminPanelSettingsOutlined fontSize="small" />, onClick: (row) => open("promote", row) },
    );
    actions.push(
      u.status === "active"
        ? { label: "إيقاف الحساب", icon: <BlockOutlined fontSize="small" />, onClick: (row) => open("deactivate", row), disabled: isMe }
        : { label: "تفعيل الحساب", icon: <CheckCircleOutlineOutlined fontSize="small" />, onClick: (row) => open("activate", row) },
    );
    actions.push({
      label: isMe ? "حذف (لا يمكن حذف حسابك)" : "حذف",
      icon: <DeleteOutlineOutlined fontSize="small" />,
      destructive: true,
      onClick: (row) => open("delete", row),
      disabled: isMe,
    });
    return actions;
  };

  const action = pending ? ACTIONS[pending.kind] : null;

  return (
    <>
      <DataTable
        label="المستخدمون"
        mode="server"
        rows={users.data?.rows ?? []}
        columns={columns}
        getRowId={(u) => u._id}
        getRowLabel={(u) => displayName(u)}
        pagination={{
          page: table.page,
          pageSize: table.pageSize,
          onPageChange: table.setPage,
          onPageSizeChange: table.setPageSize,
          pageSizeOptions: [10, 25, 50],
          total: users.data?.total ?? 0,
        }}
        toolbar={
          <SearchField
            label="بحث بالاسم أو البريد"
            value={search}
            onChange={(value) => {
              setSearch(value);
              // A new search starts at the first page; page 3 of the old results may not exist.
              table.setPage(0);
            }}
          />
        }
        rowActions={rowActions}
        loading={users.isFetching}
        error={users.isError}
        errorTitle="تعذّر تحميل المستخدمين"
        onRetry={() => users.refetch()}
        empty={
          debouncedSearch.trim()
            ? { icon: <PersonSearchOutlined />, title: "لا يوجد مستخدمون مطابقون", description: "جرّب اسمًا أو بريدًا آخر." }
            : { title: "لا يوجد مستخدمون بعد", description: "يظهر هنا كل من ينشئ حسابًا في الموقع." }
        }
      />

      <ConfirmDialog
        open={Boolean(pending)}
        title={action?.title ?? ""}
        description={pending && action ? action.description(pending.user) : ""}
        confirmLabel={action?.confirm ?? ""}
        loadingLabel={action?.loading}
        destructive={action?.destructive ?? true}
        loading={running}
        onConfirm={run}
        onClose={close}
      >
        {actionError && (
          <Alert severity="error" role="alert" sx={{ mt: 2 }}>
            {actionError}
          </Alert>
        )}
      </ConfirmDialog>
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        title="المستخدمون"
        description="ابحث عن الحسابات، وغيّر الصلاحيات، وأوقف الحسابات أو احذفها."
        breadcrumbs={[{ label: "لوحة الإدارة", href: "/admin/dashboard" }, { label: "المستخدمون" }]}
      />
      <AdminGuard>
        <UsersTable />
      </AdminGuard>
    </>
  );
}
