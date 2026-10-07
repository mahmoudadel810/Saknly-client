"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, type Theme } from "@mui/material/styles";
import MoreVertOutlined from "@mui/icons-material/MoreVertOutlined";
import EmptyState, { type EmptyStateProps } from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState, { TableRowsSkeleton } from "./LoadingState";
import { visuallyHidden } from "./a11y";

export type SortDirection = "asc" | "desc";

export interface DataTableSort {
  columnId: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** Shows a sort control. In client mode the column also needs `sortValue`. */
  sortable?: boolean;
  /** The value client-side sorting compares. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  /** Logical alignment; numbers and prices use "end". */
  align?: "start" | "center" | "end";
  /** Hides the column in the table below this breakpoint (the table itself only shows from md up). */
  hideBelow?: "lg" | "xl";
  width?: number | string;
  /**
   * In the stacked card list (below md): "title" makes this cell the card heading, "hidden" leaves it out.
   * Other columns appear as label and value pairs, labelled with `cardLabel` or a string `header`.
   */
  card?: "title" | "hidden";
  cardLabel?: string;
}

export interface DataTableRowAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  /** Colours the item as destructive; the caller still confirms with ConfirmDialog. */
  destructive?: boolean;
  disabled?: boolean;
}

export interface DataTablePagination {
  /** Zero-based. */
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  /** Server mode: the total number of rows on the server. Client mode ignores it and uses rows.length. */
  total?: number;
}

export interface DataTableSelection {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Rendered in the bulk bar while at least one row is selected. */
  bulkActions?: (selectedIds: string[]) => React.ReactNode;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  /** The table's accessible name, e.g. "العقارات بانتظار المراجعة". */
  label: string;
  /** Names a row in the row-actions button label and the selection checkbox label. */
  getRowLabel?: (row: T) => string;
  /**
   * "client" (default): rows is the full set; the table sorts and pages it.
   * "server": rows is the current page, already sorted; pagination.total is the full count.
   */
  mode?: "client" | "server";
  /** Search and filters, above the table. */
  toolbar?: React.ReactNode;
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort) => void;
  pagination?: DataTablePagination;
  selection?: DataTableSelection;
  rowActions?: (row: T) => DataTableRowAction<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  /** True when the last load failed. Pass a plain title, never the error itself. */
  error?: boolean;
  errorTitle?: string;
  onRetry?: () => void;
  empty?: EmptyStateProps;
}

const DEFAULT_EMPTY: EmptyStateProps = { title: "لا توجد بيانات", description: "لا يوجد ما يُعرض هنا بعد." };

const textAlign = (align: DataTableColumn<unknown>["align"]) => align ?? "start";

const hideSx = (theme: Theme, hideBelow?: "lg" | "xl") =>
  hideBelow ? { [theme.breakpoints.down(hideBelow)]: { display: "none" } } : undefined;

const compareValues = (a: unknown, b: unknown): number => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "ar");
};

const toggleDirection = (current: DataTableSort | null | undefined, columnId: string): DataTableSort =>
  current?.columnId === columnId && current.direction === "asc"
    ? { columnId, direction: "desc" }
    : { columnId, direction: "asc" };

/**
 * Sort and page state for a DataTable. Server-mode callers put `sort`, `page` and `pageSize` in their query
 * key; client-mode callers just pass them through.
 */
export function useDataTableState(initial?: { sort?: DataTableSort | null; pageSize?: number }) {
  const [sort, setSortState] = useState<DataTableSort | null>(initial?.sort ?? null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(initial?.pageSize ?? 10);
  const setSort = useCallback((next: DataTableSort) => {
    setSortState(next);
    setPage(0);
  }, []);
  const setPageSize = useCallback((next: number) => {
    setPageSizeState(next);
    setPage(0);
  }, []);
  return { sort, setSort, page, setPage, pageSize, setPageSize };
}

/**
 * The admin and account table (DESIGN-SYSTEM.md, Components): toolbar slot, sortable headers, dense 44px rows
 * with hover, optional selection with a bulk bar, row actions in a kebab menu, pagination, and loading, empty
 * and error states. Below md each row renders as a stacked card.
 */
export default function DataTable<T>({
  rows,
  columns,
  getRowId,
  label,
  getRowLabel,
  mode = "client",
  toolbar,
  sort,
  onSortChange,
  pagination,
  selection,
  rowActions,
  onRowClick,
  loading = false,
  error = false,
  errorTitle,
  onRetry,
  empty = DEFAULT_EMPTY,
}: DataTableProps<T>) {
  const theme = useTheme();
  const isCardList = useMediaQuery(theme.breakpoints.down("md"));
  const [menu, setMenu] = useState<{ anchor: HTMLElement; row: T } | null>(null);
  const menuId = React.useId();

  const visibleRows = useMemo(() => {
    if (mode === "server") return rows;
    let result = rows;
    const column = sort ? columns.find((c) => c.id === sort.columnId) : undefined;
    if (sort && column?.sortValue) {
      const value = column.sortValue;
      const factor = sort.direction === "asc" ? 1 : -1;
      result = [...rows].sort((a, b) => factor * compareValues(value(a), value(b)));
    }
    if (pagination) {
      const start = pagination.page * pagination.pageSize;
      result = result.slice(start, start + pagination.pageSize);
    }
    return result;
  }, [mode, rows, columns, sort, pagination]);

  // Client mode: when rows disappear (e.g. the last row on the last page was approved), step back to the
  // last page that still has rows instead of showing an empty page.
  const lastPage = pagination ? Math.max(0, Math.ceil(rows.length / pagination.pageSize) - 1) : 0;
  useEffect(() => {
    if (mode === "client" && pagination && pagination.page > lastPage) pagination.onPageChange(lastPage);
  }, [mode, pagination, lastPage]);

  const total = mode === "server" ? pagination?.total ?? rows.length : rows.length;
  const selectedSet = useMemo(() => new Set(selection?.selectedIds ?? []), [selection?.selectedIds]);
  const pageIds = visibleRows.map(getRowId);
  const selectedOnPage = pageIds.filter((id) => selectedSet.has(id)).length;
  const hasActions = Boolean(rowActions);
  const columnCount = columns.length + (selection ? 1 : 0) + (hasActions ? 1 : 0);
  const rowName = (row: T) => getRowLabel?.(row);

  const toggleRow = (id: string) => {
    if (!selection) return;
    selection.onChange(
      selectedSet.has(id) ? selection.selectedIds.filter((x) => x !== id) : [...selection.selectedIds, id],
    );
  };
  const togglePage = () => {
    if (!selection) return;
    if (selectedOnPage === pageIds.length) {
      selection.onChange(selection.selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      selection.onChange([...selection.selectedIds, ...pageIds.filter((id) => !selectedSet.has(id))]);
    }
  };

  const showSkeleton = loading && rows.length === 0 && !error;
  const showError = error && rows.length === 0;
  const showEmpty = !loading && !error && rows.length === 0;
  const refreshing = loading && rows.length > 0;

  const actionsButton = (row: T) => {
    const name = rowName(row);
    return (
      <IconButton
        size="small"
        aria-label={name ? `إجراءات: ${name}` : "إجراءات الصف"}
        aria-haspopup="menu"
        aria-controls={menu?.row === row ? menuId : undefined}
        aria-expanded={menu?.row === row ? true : undefined}
        onClick={(event) => {
          event.stopPropagation();
          setMenu({ anchor: event.currentTarget, row });
        }}
      >
        <MoreVertOutlined fontSize="small" />
      </IconButton>
    );
  };

  const selectBox = (row: T) => {
    const id = getRowId(row);
    const name = rowName(row);
    return (
      <Checkbox
        size="small"
        checked={selectedSet.has(id)}
        onClick={(event) => event.stopPropagation()}
        onChange={() => toggleRow(id)}
        slotProps={{ input: { "aria-label": name ? `تحديد ${name}` : "تحديد الصف" } }}
      />
    );
  };

  const stateBlock = showSkeleton ? (
    <LoadingState variant="rows" rows={Math.min(pagination?.pageSize ?? 5, 8)} />
  ) : showError ? (
    <ErrorState compact title={errorTitle} onRetry={onRetry} retrying={loading} />
  ) : showEmpty ? (
    <EmptyState compact {...empty} />
  ) : null;

  const bulkBar =
    selection && selection.selectedIds.length > 0 ? (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          bgcolor: "var(--c-primary-soft)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2" role="status" sx={{ marginInlineEnd: "auto" }}>
          تم تحديد <span className="num">{selection.selectedIds.length}</span>
        </Typography>
        {selection.bulkActions?.(selection.selectedIds)}
        <Button size="small" color="inherit" onClick={() => selection.onChange([])}>
          إلغاء التحديد
        </Button>
      </Box>
    ) : null;

  const table = (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table aria-label={label} aria-busy={loading || undefined}>
        <TableHead>
          <TableRow>
            {selection && (
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  disabled={pageIds.length === 0}
                  checked={pageIds.length > 0 && selectedOnPage === pageIds.length}
                  indeterminate={selectedOnPage > 0 && selectedOnPage < pageIds.length}
                  onChange={togglePage}
                  slotProps={{ input: { "aria-label": "تحديد كل صفوف الصفحة" } }}
                />
              </TableCell>
            )}
            {columns.map((column) => {
              const active = sort?.columnId === column.id;
              return (
                <TableCell
                  key={column.id}
                  scope="col"
                  aria-sort={active ? (sort!.direction === "asc" ? "ascending" : "descending") : undefined}
                  sx={{ textAlign: textAlign(column.align), width: column.width, whiteSpace: "nowrap", ...hideSx(theme, column.hideBelow) }}
                >
                  {column.sortable && onSortChange ? (
                    <TableSortLabel
                      active={active}
                      direction={active ? sort!.direction : "asc"}
                      onClick={() => onSortChange(toggleDirection(sort, column.id))}
                    >
                      {column.header}
                    </TableSortLabel>
                  ) : (
                    column.header
                  )}
                </TableCell>
              );
            })}
            {hasActions && (
              <TableCell sx={{ width: 56 }}>
                <Box component="span" sx={visuallyHidden}>
                  إجراءات
                </Box>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {showSkeleton && <TableRowsSkeleton rows={Math.min(pagination?.pageSize ?? 5, 8)} columns={columnCount} />}
          {(showError || showEmpty) && (
            <TableRow>
              <TableCell colSpan={columnCount} sx={{ borderBottom: 0 }}>
                {stateBlock}
              </TableCell>
            </TableRow>
          )}
          {visibleRows.map((row) => {
            const id = getRowId(row);
            const selected = selectedSet.has(id);
            return (
              <TableRow
                key={id}
                hover
                selected={selected}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{
                  height: 44,
                  cursor: onRowClick ? "pointer" : undefined,
                  "&.Mui-selected, &.Mui-selected:hover": { bgcolor: "var(--c-primary-soft)" },
                }}
              >
                {selection && <TableCell padding="checkbox">{selectBox(row)}</TableCell>}
                {columns.map((column) => (
                  <TableCell key={column.id} sx={{ textAlign: textAlign(column.align), ...hideSx(theme, column.hideBelow) }}>
                    {column.cell(row)}
                  </TableCell>
                ))}
                {hasActions && <TableCell sx={{ textAlign: "end", py: 0 }}>{actionsButton(row)}</TableCell>}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const cardList = stateBlock ?? (
    <Box component="ul" aria-label={label} aria-busy={loading || undefined} sx={{ p: 0, m: 0, listStyle: "none" }}>
      {visibleRows.map((row) => {
        const id = getRowId(row);
        const titleColumn = columns.find((c) => c.card === "title");
        const fields = columns.filter((c) => c.card !== "title" && c.card !== "hidden");
        return (
          <Box
            component="li"
            key={id}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              cursor: onRowClick ? "pointer" : undefined,
              bgcolor: selectedSet.has(id) ? "var(--c-primary-soft)" : undefined,
              "&:last-of-type": { borderBottom: 0 },
            }}
          >
            {selection && <Box sx={{ marginInlineStart: -1 }}>{selectBox(row)}</Box>}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {titleColumn && (
                <Typography variant="h6" component="div" sx={{ fontSize: "0.9375rem", mb: 0.5 }}>
                  {titleColumn.cell(row)}
                </Typography>
              )}
              <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 1.5, rowGap: 0.5 }}>
                {fields.map((column) => (
                  <React.Fragment key={column.id}>
                    <Typography component="dt" variant="caption" color="text.secondary">
                      {column.cardLabel ?? (typeof column.header === "string" ? column.header : column.id)}
                    </Typography>
                    <Typography component="dd" variant="caption" sx={{ m: 0, minWidth: 0 }}>
                      {column.cell(row)}
                    </Typography>
                  </React.Fragment>
                ))}
              </Box>
            </Box>
            {hasActions && <Box sx={{ marginInlineEnd: -1 }}>{actionsButton(row)}</Box>}
          </Box>
        );
      })}
    </Box>
  );

  const menuActions = menu && rowActions ? rowActions(menu.row) : [];
  const menuEdge = theme.direction === "rtl" ? "left" : "right";

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: "10px",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {toolbar && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {toolbar}
        </Box>
      )}
      {bulkBar}
      <Box sx={{ height: 2 }}>{refreshing && <LinearProgress aria-label="جاري التحديث" sx={{ height: 2 }} />}</Box>
      {isCardList ? cardList : table}
      {pagination && total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={pagination.page}
          rowsPerPage={pagination.pageSize}
          rowsPerPageOptions={pagination.onPageSizeChange ? pagination.pageSizeOptions ?? [10, 25, 50] : []}
          onPageChange={(_, page) => pagination.onPageChange(page)}
          onRowsPerPageChange={(event) => pagination.onPageSizeChange?.(Number(event.target.value))}
          labelRowsPerPage="عدد الصفوف:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} من ${count}`}
          getItemAriaLabel={(type) => (type === "next" ? "الصفحة التالية" : type === "previous" ? "الصفحة السابقة" : type === "first" ? "الصفحة الأولى" : "الصفحة الأخيرة")}
          sx={{ borderTop: 1, borderColor: "divider", "& .MuiTablePagination-displayedRows": { fontVariantNumeric: "tabular-nums" } }}
        />
      )}
      <Menu
        id={menuId}
        anchorEl={menu?.anchor ?? null}
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: menuEdge }}
        transformOrigin={{ vertical: "top", horizontal: menuEdge }}
      >
        {menuActions.map((action) => (
          <MenuItem
            key={action.label}
            disabled={action.disabled}
            onClick={() => {
              const row = menu!.row;
              setMenu(null);
              action.onClick(row);
            }}
            sx={action.destructive ? { color: "error.main" } : undefined}
          >
            {action.icon && (
              <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>{action.icon}</ListItemIcon>
            )}
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

