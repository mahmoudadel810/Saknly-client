"use client";

import React, { Suspense, useEffect, useId, useState } from "react";
import Link from "next/link";
import Logo from "@/shared/ui/Logo";
import { usePathname, useSearchParams } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
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
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { useTheme } from "@mui/material/styles";
import AddHomeOutlined from "@mui/icons-material/AddHomeOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import LoginOutlined from "@mui/icons-material/LoginOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import { useAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WishlistContext";
import ThemeToggle from "@/shared/ui/ThemeToggle";

type Query = URLSearchParams | null;

/**
 * Header navigation (DESIGN-SYSTEM.md, Shells). There is no agencies index route (only /agencies/[id]), so
 * the agencies link waits for one. Student housing is the browse page's own filter.
 */
const NAV_LINKS: { href: string; label: string; isActive: (pathname: string, query: Query) => boolean }[] = [
  {
    href: "/properties",
    label: "العقارات",
    isActive: (pathname, query) =>
      pathname.startsWith("/properties") && query?.get("isStudentFriendly") !== "true",
  },
  {
    href: "/properties?isStudentFriendly=true",
    label: "سكن طلابي",
    isActive: (pathname, query) => pathname === "/properties" && query?.get("isStudentFriendly") === "true",
  },
];

function WithQuery({ children }: { children: (query: Query) => React.ReactNode }) {
  return <>{children(useSearchParams())}</>;
}

/**
 * useSearchParams in a layout needs its own Suspense boundary, or every statically rendered page bails out
 * of prerendering. The fallback renders the same links without the query-dependent active state.
 */
function QueryAware({ children }: { children: (query: Query) => React.ReactNode }) {
  return (
    <Suspense fallback={children(null)}>
      <WithQuery>{children}</WithQuery>
    </Suspense>
  );
}

function HomeLogo() {
  return (
    <Box
      component={Link}
      href="/"
      aria-label="سكنلي، الصفحة الرئيسية"
      sx={{ display: "inline-flex", alignItems: "center", color: "text.primary", textDecoration: "none", borderRadius: "6px" }}
    >
      <Logo size={32} />
    </Box>
  );
}

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const { getWishlistCount } = useWishlist();
  const pathname = usePathname() ?? "/";
  const theme = useTheme();
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const accountMenuId = useId();
  const drawerId = useId();
  const wishlistCount: number = getWishlistCount();
  const isAdmin = user?.role === "admin";
  const displayName = user?.userName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "حسابي";
  // Menus open from the inline-end edge of their button (Popover origins are physical).
  const endEdge = theme.direction === "rtl" ? "left" : "right";

  // A navigation closes the drawer and the account menu.
  useEffect(() => {
    setDrawerOpen(false);
    setMenuAnchor(null);
  }, [pathname]);

  const closeMenu = () => setMenuAnchor(null);

  const navButtonSx = (active: boolean) => ({
    px: 1.5,
    height: 40,
    color: active ? "primary.main" : "text.secondary",
    bgcolor: active ? "var(--c-primary-soft)" : "transparent",
    fontWeight: active ? 600 : 500,
    "&:hover": { bgcolor: active ? "var(--c-primary-soft)" : "action.hover", color: active ? "primary.main" : "text.primary" },
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
        boxShadow: scrolled ? 3 : "none",
        transition: "box-shadow 200ms ease-out",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          height: 64,
          width: "100%",
          maxWidth: 1240,
          mx: "auto",
          px: { xs: 2, md: 3 },
        }}
      >
        <HomeLogo />

        <Box
          component="nav"
          aria-label="التنقل الرئيسي"
          sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5, marginInlineStart: 3 }}
        >
          <QueryAware>
            {(query) =>
              NAV_LINKS.map((link) => {
                const active = link.isActive(pathname, query);
                return (
                  <Button
                    key={link.href}
                    component={Link}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    sx={navButtonSx(active)}
                  >
                    {link.label}
                  </Button>
                );
              })
            }
          </QueryAware>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginInlineStart: "auto" }}>
          <Button
            component={Link}
            href="/uploadProperty"
            variant="outlined"
            color="primary"
            startIcon={<AddHomeOutlined />}
            sx={{ display: { xs: "none", md: "inline-flex" }, height: 36 }}
          >
            أضف عقارك
          </Button>

          <ThemeToggle />

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            {isLoading ? (
              <Skeleton variant="circular" width={32} height={32} aria-hidden />
            ) : user ? (
              <>
                <IconButton
                  onClick={(event) => setMenuAnchor(event.currentTarget)}
                  aria-label="قائمة الحساب"
                  aria-haspopup="menu"
                  aria-controls={menuAnchor ? accountMenuId : undefined}
                  aria-expanded={menuAnchor ? true : undefined}
                  sx={{ p: 0.5 }}
                >
                  <Avatar
                    src={user.avatar?.url}
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
                    {user.email && (
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
                    حسابي
                  </MenuItem>
                  <MenuItem component={Link} href="/wishlist" onClick={closeMenu}>
                    <ListItemIcon>
                      <FavoriteBorderOutlined fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>المفضلة</ListItemText>
                    {wishlistCount > 0 && (
                      <Typography variant="caption" color="text.secondary" className="num">
                        {wishlistCount}
                      </Typography>
                    )}
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem component={Link} href="/admin/dashboard" onClick={closeMenu}>
                      <ListItemIcon>
                        <DashboardOutlined fontSize="small" />
                      </ListItemIcon>
                      لوحة التحكم
                    </MenuItem>
                  )}
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
              </>
            ) : (
              <>
                <Button component={Link} href="/login" color="inherit" sx={{ height: 36 }}>
                  تسجيل الدخول
                </Button>
                <Button component={Link} href="/register" variant="contained" sx={{ height: 36 }}>
                  إنشاء حساب
                </Button>
              </>
            )}
          </Box>

          <IconButton
            onClick={() => setDrawerOpen(true)}
            aria-label="فتح القائمة"
            aria-haspopup="dialog"
            aria-controls={drawerOpen ? drawerId : undefined}
            aria-expanded={drawerOpen}
            sx={{ display: { xs: "inline-flex", md: "none" }, color: "text.primary" }}
          >
            <MenuOutlined />
          </IconButton>
        </Box>
      </Box>

      {/* The menu button sits at the inline end, so the drawer opens there ("right" is flipped by the RTL theme). */}
      <Drawer
        id={drawerId}
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 288, maxWidth: "85vw" } } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            px: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <HomeLogo />
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="إغلاق القائمة">
            <CloseOutlined />
          </IconButton>
        </Box>

        <Box component="nav" aria-label="التنقل الرئيسي">
          <List sx={{ px: 1, py: 1 }}>
            <QueryAware>
              {(query) =>
                NAV_LINKS.map((link) => {
                  const active = link.isActive(pathname, query);
                  return (
                    <ListItemButton
                      key={link.href}
                      component={Link}
                      href={link.href}
                      selected={active}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setDrawerOpen(false)}
                      sx={{
                        borderRadius: "6px",
                        "&.Mui-selected, &.Mui-selected:hover": { bgcolor: "var(--c-primary-soft)", color: "primary.main" },
                      }}
                    >
                      <ListItemText primary={link.label} slotProps={{ primary: { fontWeight: active ? 600 : 500 } }} />
                    </ListItemButton>
                  );
                })
              }
            </QueryAware>
          </List>
        </Box>

        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            component={Link}
            href="/uploadProperty"
            variant="outlined"
            fullWidth
            startIcon={<AddHomeOutlined />}
            onClick={() => setDrawerOpen(false)}
          >
            أضف عقارك
          </Button>
        </Box>

        <Divider />

        {isLoading ? null : user ? (
          <List sx={{ px: 1, py: 1 }} aria-label="الحساب">
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {displayName}
              </Typography>
              {user.email && (
                <Typography variant="caption" color="text.secondary" noWrap component="p">
                  {user.email}
                </Typography>
              )}
            </Box>
            <ListItemButton component={Link} href="/userProfile" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: "6px" }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PersonOutlineOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="حسابي" />
            </ListItemButton>
            <ListItemButton component={Link} href="/wishlist" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: "6px" }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <FavoriteBorderOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="المفضلة" />
              {wishlistCount > 0 && (
                <Typography variant="caption" color="text.secondary" className="num">
                  {wishlistCount}
                </Typography>
              )}
            </ListItemButton>
            {isAdmin && (
              <ListItemButton component={Link} href="/admin/dashboard" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: "6px" }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <DashboardOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="لوحة التحكم" />
              </ListItemButton>
            )}
            <ListItemButton
              onClick={() => {
                setDrawerOpen(false);
                logout();
              }}
              sx={{ borderRadius: "6px", color: "error.main" }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <LogoutOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="تسجيل الخروج" />
            </ListItemButton>
          </List>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2 }}>
            <Button
              component={Link}
              href="/login"
              variant="contained"
              startIcon={<LoginOutlined />}
              onClick={() => setDrawerOpen(false)}
            >
              تسجيل الدخول
            </Button>
            <Button component={Link} href="/register" color="inherit" onClick={() => setDrawerOpen(false)}>
              إنشاء حساب
            </Button>
          </Box>
        )}
      </Drawer>
    </AppBar>
  );
}
