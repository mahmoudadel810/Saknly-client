"use client";

import React, { useEffect, useId, useState } from "react";
import Link from "next/link";
import { LogoMark } from "./Logo";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import MailOutlineOutlined from "@mui/icons-material/MailOutlineOutlined";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import PeopleOutlineOutlined from "@mui/icons-material/PeopleOutlineOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import SpaceDashboardOutlined from "@mui/icons-material/SpaceDashboardOutlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import { useAuth } from "@/app/context/AuthContext";
import { countPending, pendingPropertiesQuery } from "@/shared/services/pendingProperties";
import ThemeToggle from "./ThemeToggle";
import { visuallyHidden } from "./a11y";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Only this exact path is active (the dashboard is the parent of the other routes). */
  exact?: boolean;
  pendingBadge?: boolean;
}

/** The admin routes, grouped as in DESIGN-SYSTEM.md (Shells). */
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "نظرة عامة",
    items: [{ href: "/admin/dashboard", label: "لوحة المعلومات", icon: <SpaceDashboardOutlined />, exact: true }],
  },
  {
    label: "الإشراف",
    items: [
      { href: "/admin/dashboard/properties", label: "العقارات", icon: <HomeWorkOutlined />, pendingBadge: true },
      { href: "/admin/dashboard/testimonials", label: "آراء العملاء", icon: <RateReviewOutlined /> },
      { href: "/admin/dashboard/inquiries", label: "الاستفسارات", icon: <MailOutlineOutlined /> },
    ],
  },
  {
    label: "الدليل",
    items: [
      { href: "/admin/dashboard/users", label: "المستخدمون", icon: <PeopleOutlineOutlined /> },
      { href: "/admin/dashboard/agencies", label: "الوكالات", icon: <BusinessOutlined /> },
    ],
  },
  {
    label: "أدوات",
    items: [{ href: "/admin/import-properties", label: "استيراد العقارات", icon: <UploadFileOutlined /> }],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

const isActive = (item: NavItem, pathname: string) =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

const pageTitle = (pathname: string) => ALL_ITEMS.find((item) => isActive(item, pathname))?.label ?? "لوحة التحكم";

const WIDTH = 240;
const COLLAPSED_WIDTH = 64;
const STORAGE_KEY = "saknly:admin-sidebar-collapsed";

function SidebarNav({
  collapsed,
  pathname,
  pendingCount,
  onNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  pendingCount: number | null;
  onNavigate?: () => void;
}) {
  const theme = useTheme();
  // Tooltips of the collapsed rail open towards the content (the inline end).
  const tooltipPlacement = theme.direction === "rtl" ? "left" : "right";

  return (
    <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
      {NAV_GROUPS.map((group, index) => (
        <Box key={group.label} component="section" aria-label={group.label}>
          {collapsed ? (
            index > 0 && <Divider sx={{ my: 1, mx: 1.5 }} />
          ) : (
            <Typography
              component="h2"
              variant="caption"
              sx={{ display: "block", px: 2.5, pt: index > 0 ? 2 : 1, pb: 0.5, color: "var(--c-muted)", fontWeight: 500 }}
            >
              {group.label}
            </Typography>
          )}
          <List disablePadding sx={{ px: 1 }}>
            {group.items.map((item) => {
              const active = isActive(item, pathname);
              const count = item.pendingBadge && pendingCount ? pendingCount : 0;
              const link = (
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={active}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  sx={{
                    minHeight: 40,
                    borderRadius: "6px",
                    px: collapsed ? 0 : 1.5,
                    justifyContent: collapsed ? "center" : "flex-start",
                    color: active ? "primary.main" : "text.secondary",
                    "&.Mui-selected, &.Mui-selected:hover": { bgcolor: "var(--c-primary-soft)" },
                    "&:hover": { color: active ? "primary.main" : "text.primary" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, marginInlineEnd: collapsed ? 0 : 1.5, color: "inherit" }}>
                    {collapsed && count > 0 ? (
                      <Badge color="warning" badgeContent={count} max={99} overlap="circular">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  {collapsed ? (
                    <Box component="span" sx={visuallyHidden}>
                      {item.label}
                    </Box>
                  ) : (
                    <ListItemText
                      primary={item.label}
                      slotProps={{ primary: { fontSize: "0.875rem", fontWeight: active ? 600 : 500, noWrap: true } }}
                    />
                  )}
                  {!collapsed && count > 0 && (
                    <Box
                      component="span"
                      aria-hidden
                      sx={{
                        minWidth: 24,
                        height: 20,
                        px: 0.75,
                        borderRadius: "6px",
                        display: "inline-grid",
                        placeItems: "center",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--c-warning)",
                        bgcolor: "color-mix(in srgb, var(--c-warning) 8%, var(--c-surface))",
                        border: "1px solid color-mix(in srgb, var(--c-warning) 35%, transparent)",
                      }}
                    >
                      {count > 99 ? "99+" : count}
                    </Box>
                  )}
                  {count > 0 && (
                    <Box component="span" sx={visuallyHidden}>
                      {`، ${count} بانتظار المراجعة`}
                    </Box>
                  )}
                </ListItemButton>
              );
              return (
                <li key={item.href}>
                  {collapsed ? (
                    <Tooltip title={item.label} placement={tooltipPlacement}>
                      {link}
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Box
      sx={{
        height: 64,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: 1,
        px: collapsed ? 0 : 2.5,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <LogoMark size={28} />
      {!collapsed && (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.2 }}>سكنلي</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: "block" }}>
            لوحة الإدارة
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/**
 * The admin shell (DESIGN-SYSTEM.md, Shells): a grouped sidebar, 240px and collapsible to a 64px rail on
 * desktop (remembered per browser), a temporary drawer on mobile, and a header with the page title, a link to
 * the public site and the account menu. Access control stays in middleware.ts and the pages.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin/dashboard";
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const sidebarId = useId();
  const accountMenuId = useId();
  const { data: pending } = useQuery(pendingPropertiesQuery);
  // Unknown is not zero: no badge while loading or after a failed request.
  const pendingCount = pending ? countPending(pending) : null;
  const rtl = theme.direction === "rtl";
  const endEdge = rtl ? "left" : "right";
  const displayName = user?.userName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "المشرف";

  // Read the remembered state after mount (the server has no localStorage; storage may be blocked).
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // Keep the expanded default.
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuAnchor(null);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Not remembered; the toggle still works for this page view.
      }
      return next;
    });
  };

  // Collapsing moves the rail's edge towards the inline start.
  const CollapseIcon = collapsed === rtl ? ChevronLeftOutlined : ChevronRightOutlined;
  const closeMenu = () => setMenuAnchor(null);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="nav"
        id={sidebarId}
        aria-label="قائمة الإدارة"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          width: collapsed ? COLLAPSED_WIDTH : WIDTH,
          transition: "width 200ms ease-out",
          bgcolor: "background.paper",
          borderInlineEnd: 1,
          borderColor: "divider",
        }}
      >
        <Brand collapsed={collapsed} />
        <SidebarNav collapsed={collapsed} pathname={pathname} pendingCount={pendingCount} />
        <Box sx={{ borderTop: 1, borderColor: "divider", p: 1, display: "flex", justifyContent: collapsed ? "center" : "flex-end" }}>
          <Tooltip title={collapsed ? "توسيع القائمة" : "طي القائمة"} placement={collapsed ? endEdge : "top"}>
            <IconButton
              onClick={toggleCollapsed}
              aria-label={collapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"}
              aria-expanded={!collapsed}
              aria-controls={sidebarId}
              size="small"
            >
              <CollapseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Mobile: the same navigation in a temporary drawer at the inline start ("left" is flipped by the RTL theme). */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: "none" } }}
        slotProps={{ paper: { sx: { width: WIDTH, maxWidth: "85vw", display: "flex", flexDirection: "column" } } }}
      >
        <Box component="nav" aria-label="قائمة الإدارة" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Brand collapsed={false} />
          <SidebarNav collapsed={false} pathname={pathname} pendingCount={pendingCount} onNavigate={() => setMobileOpen(false)} />
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: "appBar",
            height: 64,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: { xs: 1, md: 3 },
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            aria-label="فتح قائمة الإدارة"
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuOutlined />
          </IconButton>
          <Typography component="div" noWrap sx={{ fontSize: "1.125rem", fontWeight: 600, minWidth: 0 }}>
            {pageTitle(pathname)}
          </Typography>

          <Box sx={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
            <Button
              component={Link}
              href="/"
              color="inherit"
              startIcon={<StorefrontOutlined />}
              sx={{ color: "text.secondary", display: { xs: "none", sm: "inline-flex" } }}
            >
              عرض الموقع
            </Button>
            <Tooltip title="عرض الموقع">
              <IconButton component={Link} href="/" aria-label="عرض الموقع" sx={{ display: { xs: "inline-flex", sm: "none" } }}>
                <StorefrontOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <ThemeToggle />
            <IconButton
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              aria-label="قائمة الحساب"
              aria-haspopup="menu"
              aria-controls={menuAnchor ? accountMenuId : undefined}
              aria-expanded={menuAnchor ? true : undefined}
              sx={{ p: 0.5 }}
            >
              <Avatar
                src={user?.avatar?.url}
                alt=""
                sx={{ width: 32, height: 32, fontSize: "0.875rem", bgcolor: "primary.main", color: "primary.contrastText" }}
              >
                {displayName.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id={accountMenuId}
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={closeMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: endEdge }}
              transformOrigin={{ vertical: "top", horizontal: endEdge }}
              slotProps={{ paper: { sx: { mt: 1, minWidth: 220 } } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {displayName}
                </Typography>
                {user?.email && (
                  <Typography variant="caption" color="text.secondary" noWrap component="p">
                    {user.email}
                  </Typography>
                )}
              </Box>
              <Divider />
              <MenuItem component={Link} href="/userProfile" onClick={closeMenu}>
                <ListItemIcon>
                  <PersonOutlineOutlined fontSize="small" />
                </ListItemIcon>
                الملف الشخصي
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  closeMenu();
                  logout();
                }}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>
                  <LogoutOutlined fontSize="small" />
                </ListItemIcon>
                تسجيل الخروج
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Box
          component="main"
          sx={{ flex: 1, width: "100%", maxWidth: 1440, mx: "auto", px: { xs: 2, md: 3 }, py: 3, minWidth: 0 }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
