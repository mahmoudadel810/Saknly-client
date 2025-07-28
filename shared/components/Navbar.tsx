"use client";

import React, { useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WishlistContext";
import Image from "next/image";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import DarkModeToggle from "./DarkModeToggle";
import { useToast } from '@/shared/provider/ToastProvider';

const NAV_LINKS = [
  { label: "الرئيسية", href: "/", icon: <HomeIcon sx={{ ml: 0.5 }} /> },
  { label: "العقارات", href: "/properties" },
  { label: "من نحن", href: "/about" },
  { label: "اتصل بنا", href: "/contact" },
  { label: "قائمة الأمنيات", href: "/wishlist", icon: <FavoriteBorderIcon sx={{ ml: 1, mr: 1 }} /> },
];


export default function Navbar() {
  const { user, logout } = useAuth();
  const { getWishlistCount } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [uploadAnchorEl, setUploadAnchorEl] = useState(null);


  // Profile menu
  const handleMenu = (event: any) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Upload menu
  const handleUploadMenu = (event: any) => setUploadAnchorEl(event.currentTarget);
  const handleUploadClose = () => setUploadAnchorEl(null);

  // Drawer
  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);

  // RTL: logo right, menu left
  return (
    <AppBar 
      position="sticky" 
      color="inherit" 
      elevation={0} 
      className="bg-white/92 dark:bg-[#1f2937] border-b border-gray-200/40 dark:border-dark-700/40 text-black dark:text-white"
      sx={{ 
        direction: "rtl", 
        zIndex: 1201, 
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        minHeight: 60,
        px: { xs: 2, md: 4 },
        maxWidth: 1400,
        mx: 'auto',
        width: '100%'
      }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: 'none' }} aria-label="سكنلي الرئيسية">
            <Box sx={{ 
              position: 'relative',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.03)' }
            }}>
              <Image 
                src="/logo.svg" 
                alt="شعار سكنلي" 
                width={36} 
                height={36} 
                style={{ marginLeft: 10, transition: 'filter 0.18s' }} 
                className="navbar-logo" 
              />
            </Box>
            <Typography 
              variant="h6" 
              className="navbar-logo-text dark:text-white text-black"
              sx={{ 
                fontWeight: 800, 
                ml: 1.2, 
                fontFamily: 'Cairo, sans-serif',
                letterSpacing: '-0.3px',
                transition: 'color 0.2s ease',
                '&:hover': { color: 'primary.light' }
              }}
            >
              سكنلي
            </Typography>
          </Link>
        </Box>

        {/* Desktop Menu */}
        {!isMobile && (
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 0.8,
            flex: 1,
            justifyContent: 'center'
          }}>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const isWishlistLink = link.href === "/wishlist";
              
              return (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  startIcon={isWishlistLink ? (
                    <Badge 
                      badgeContent={getWishlistCount()} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          minWidth: '18px',
                          height: '18px',
                          borderRadius: '9px',
                          bgcolor: 'error.main',
                          color: 'white',
                          fontWeight: 'bold'
                        }
                      }}
                    >
                      <FavoriteBorderIcon sx={{ ml: 1, mr: 1 }} />
                    </Badge>
                  ) : link.icon}
                  className={"dark:text-white text-black" + (isActive ? " font-semibold" : " font-normal")}
                  sx={{
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: 'Cairo, sans-serif',
                    fontSize: '0.9rem',
                    px: 1.8,
                    py: 1,
                    mx: 0.3,
                    borderRadius: 1.5,
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&::after': isActive ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '50%',
                      height: '1.5px',
                      bgcolor: 'primary.main',
                      borderRadius: 1
                    } : {},
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: 'rgba(59, 130, 246, 0.06)',
                      transform: 'translateY(-0.5px)'
                    }
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Right Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          {/* Dark Mode Toggle */}
          <DarkModeToggle />
          {/* Admin-only pending properties link */}
          {!isMobile && user && user.role === 'admin' && (
            <Button
              component={Link}
              href="/admin/dashboard"
              startIcon={<AddBusinessIcon sx={{ ml: 0.5 }} />}
              sx={{ 
                color: "secondary.light", 
                fontWeight: 500, 
                fontFamily: 'Cairo, sans-serif',
                fontSize: '0.85rem',
                px: 1.8,
                py: 0.8,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'secondary.light',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'secondary.light',
                  color: 'white'
                }
              }}
            >
              لوحة تحكم الأدمن
            </Button>
          )}

          {/* Upload Button */}
          {!isMobile && (
            <Button
              onClick={() => {
                if (user) {
                  router.push("/uploadProperty");
                } else {
                  showToast && showToast('يجب تسجيل الدخول أولاً لعرض عقارك', 'warning');
                  setTimeout(() => {
                    router.push("/login");
                  }, 1500);
                }
              }}
              startIcon={<AddBusinessIcon sx={{ ml: 0.5 }} />}
              sx={{ 
                color: "#fff", 
                bgcolor: "primary.light", 
                fontWeight: 500, 
                fontFamily: 'Cairo, sans-serif',
                fontSize: '0.85rem',
                px: 2.2,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 1px 4px rgba(59,130,246,0.15)',
                transition: 'all 0.2s ease',
                ml: 1,
                '&:hover': { 
                  bgcolor: 'primary.main',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.2)'
                }
              }}
            >
              أضف عقارك
            </Button>
          )}

          {/* Auth/Profile Section */}
          {user ? (
            <>
              <IconButton 
                onClick={handleMenu} 
                sx={{ 
                  ml: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.03)' }
                }} 
                aria-label="قائمة المستخدم" 
                size="medium"
              >
                <Avatar 
                  src={user?.avatar?.url} 
                  alt={user?.userName || "المستخدم"} 
                  sx={{ 
                    bgcolor: "primary.light",
                    width: 36,
                    height: 36,
                    border: '1.5px solid',
                    borderColor: 'primary.light'
                  }}
                >
                  {user?.userName?.[0] || <AccountCircleIcon />}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                dir="rtl"
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 1.5,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.04)'
                  }
                }}
              >
                <MenuItem 
                  component={Link} 
                  href="/userProfile" 
                  onClick={handleClose} 
                  sx={{ 
                    fontFamily: 'Cairo, sans-serif',
                    py: 1.2,
                    px: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'rgba(59,130,246,0.06)' }
                  }}
                >
                  <AccountCircleIcon sx={{ ml: 1, color: 'primary.light' }} /> 
                  الملف الشخصي
                </MenuItem>
                <MenuItem 
                  onClick={() => { handleClose(); logout(); }} 
                  sx={{ 
                    color: "error.light", 
                    fontFamily: 'Cairo, sans-serif',
                    py: 1.2,
                    px: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'rgba(244,67,54,0.06)' }
                  }}
                >
                  <LogoutIcon sx={{ ml: 1 }} /> 
                  تسجيل الخروج
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                href="/login" 
                color="primary" 
                variant="contained" 
                sx={{ 
                  fontWeight: 500, 
                  fontFamily: 'Cairo, sans-serif',
                  px: 2.2,
                  py: 0.8,
                  borderRadius: 2,
                  fontSize: '0.85rem',
                  bgcolor: 'primary.light',
                  boxShadow: '0 1px 4px rgba(59,130,246,0.15)',
                  transition: 'all 0.2s ease',
                  ml: 1,
                  '&:hover': { 
                    bgcolor: 'primary.main',
                    transform: 'translateY(-0.5px)',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.2)'
                  }
                }}
              >
                تسجيل الدخول
              </Button>
            </>
          )}

          {/* Mobile Hamburger */}
          {isMobile && (
            <IconButton
              edge="start"
              color="primary"
              aria-label="فتح القائمة"
              onClick={toggleDrawer(true)}
              sx={{ 
                ml: 1,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  bgcolor: 'rgba(59,130,246,0.06)',
                  transform: 'scale(1.03)' 
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ 
          sx: { 
            width: 260, 
            direction: "rtl",
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)'
          } 
        }}
      >
        <Box sx={{ p: 2.5, display: "flex", alignItems: "center", borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: 'none' }} aria-label="سكنلي الرئيسية">
            <Image src="/logo.svg" alt="شعار سكنلي" width={32} height={32} style={{ marginLeft: 8 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", ml: 1, fontFamily: 'Cairo, sans-serif' }}>
              سكنلي
            </Typography>
          </Link>
        </Box>
        <Divider />
        <List sx={{ py: 1.5 }}>
          {NAV_LINKS.map((link) => {
            const isWishlistLink = link.href === "/wishlist";
            const isActive = pathname === link.href;
            return (
              <ListItem 
                key={link.href} 
                component={Link} 
                href={link.href} 
                onClick={toggleDrawer(false)}
                sx={{
                  py: 1.2,
                  px: 2.5,
                  transition: 'all 0.2s ease',
                  bgcolor: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(59,130,246,0.06)' }
                }}
              >
                {isWishlistLink ? (
                  <Badge 
                    badgeContent={getWishlistCount()} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '9px',
                        bgcolor: 'error.main',
                        color: 'white',
                        fontWeight: 'bold'
                      }
                    }}
                  >
                    <FavoriteBorderIcon sx={{ ml: 1, mr: 1 }} />
                  </Badge>
                ) : link.icon}
                <ListItemText 
                  primary={link.label} 
                  sx={{ 
                    textAlign: "right", 
                    fontFamily: 'Cairo, sans-serif',
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.95rem',
                      color: isActive ? 'primary.main' : 'text.secondary'
                    }
                  }} 
                />
              </ListItem>
            );
          })}
          {/* Admin-only pending properties link in mobile drawer */}
          {user && user.role === 'admin' && (
            <ListItem 
              component={Link} 
              href="/admin/dashboard" 
              onClick={toggleDrawer(false)}
              sx={{
                py: 1.2,
                px: 2.5,
                transition: 'all 0.2s ease',
                bgcolor: pathname === '/admin/dashboard' ? 'rgba(156,39,176,0.08)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(156,39,176,0.06)' }
              }}
            >
              <AddBusinessIcon sx={{ ml: 1, color: 'secondary.light' }} />
              <ListItemText 
                primary="لوحة تحكم الأدمن" 
                sx={{ 
                  textAlign: "right", 
                  fontFamily: 'Cairo, sans-serif',
                  '& .MuiTypography-root': {
                    fontWeight: 400,
                    fontSize: '0.95rem',
                    color: 'secondary.light'
                  }
                }} 
              />
            </ListItem>
          )}
          <ListItem 
            component="button"
            onClick={() => {
              if (user) {
                router.push('/uploadProperty');
                setDrawerOpen(false);
              } else {
                showToast && showToast('يجب تسجيل الدخول أولاً لعرض عقارك', 'warning');
                setTimeout(() => {
                  router.push('/login');
                  setDrawerOpen(false);
                }, 1500);
              }
            }}
            sx={{
              py: 1.2,
              px: 2.5,
              transition: 'all 0.2s ease',
              bgcolor: pathname === '/uploadProperty' ? 'rgba(59,130,246,0.08)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(59,130,246,0.06)' }
            }}
          >
            <AddBusinessIcon sx={{ ml: 1, color: 'primary.light' }} />
            <ListItemText 
              primary="أضف عقارك" 
              sx={{ 
                textAlign: "right", 
                fontFamily: 'Cairo, sans-serif',
                '& .MuiTypography-root': {
                  fontWeight: 400,
                  fontSize: '0.95rem',
                  color: 'primary.light'
                }
              }} 
            />
          </ListItem>
        </List>
        <Divider />
        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.2 }}>
          {user ? (
            <>
              <Button
                component={Link}
                href="/userProfile"
                startIcon={<AccountCircleIcon />}
                sx={{ 
                  justifyContent: "flex-start", 
                  fontFamily: 'Cairo, sans-serif',
                  py: 1.2,
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'rgba(59,130,246,0.06)' }
                }}
                onClick={() => setDrawerOpen(false)}
              >
                الملف الشخصي
              </Button>
              <Button
                startIcon={<LogoutIcon />}
                color="error"
                sx={{ 
                  justifyContent: "flex-start", 
                  fontFamily: 'Cairo, sans-serif',
                  py: 1.2,
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'rgba(244,67,54,0.06)' }
                }}
                onClick={() => { setDrawerOpen(false); logout(); }}
              >
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                href="/register" 
                color="primary" 
                variant="contained" 
                sx={{ 
                  fontWeight: 500, 
                  fontFamily: 'Cairo, sans-serif',
                  py: 1.2,
                  borderRadius: 2,
                  bgcolor: 'primary.light',
                  boxShadow: '0 1px 4px rgba(59,130,246,0.15)',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'primary.main' }
                }} 
                onClick={() => setDrawerOpen(false)}
              >
                إنشاء حساب
              </Button>
            </>
          )}
        </Box>
      </Drawer>
      {/* أضف CSS صغير لتأثير hover على الشعار */}
      <style jsx global>{`
        .navbar-logo:hover, .navbar-logo-text:hover {
          filter: brightness(1.15) drop-shadow(0 2px 8px rgba(59,130,246,0.08));
          color: #174ea6 !important;
          cursor: pointer;
        }
      `}</style>
    </AppBar>
  );
}