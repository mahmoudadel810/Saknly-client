"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Dashboard,
  People,
  Business,
  Home,
  RateReview,
  Menu,
  Close,
  MailOutline,
} from "@mui/icons-material";
import {
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";

const navLinks = [
  { 
    href: "/admin/dashboard", 
    label: "الرئيسية", 
    icon: <Dashboard /> 
  },
  { 
    href: "/admin/dashboard/users", 
    label: "المستخدمين", 
    icon: <People /> 
  },
  { 
    href: "/admin/dashboard/agencies", 
    label: "الوكالات العقارية", 
    icon: <Business /> 
  },
  // إضافة رابط العقارات هنا
  { 
    href: "/admin/dashboard/properties", 
    label: "العقارات", 
    icon: <Home /> 
  },
  { 
    href: "/admin/dashboard/inquiries", 
    label: "الاستفسارات", 
    icon: <MailOutline /> 
  },
];

const AdminSideNav = () => {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const NavContent = ({ isMobileDrawer = false }) => (
    <aside className={`${isMobile && !isMobileDrawer ? 'w-16' : 'w-56'} min-h-screen bg-gray-100 border-e px-2 py-4 flex flex-col gap-2 transition-all duration-300`}>
      {/* Header */}
      <div className="mb-6">
        {isMobile && !isMobileDrawer ? (
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Dashboard className="text-white text-xl" />
            </div>
          </div>
        ) : (
          <h2 className="text-xl font-bold text-center text-gray-800">
            لوحة تحكم الأدمن
          </h2>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          
          if (isMobile && !isMobileDrawer) {
            // Mobile icon-only version
            return (
              <Tooltip key={link.href} title={link.label} placement="right">
                <Link
                  href={link.href}
                  className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "hover:bg-blue-100 text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <span className="text-xl">
                    {link.icon}
                  </span>
                </Link>
              </Tooltip>
            );
          } else {
            // Desktop or mobile drawer version with text
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow-lg"
                    : "hover:bg-blue-100 text-gray-800 hover:text-blue-600"
                }`}
                onClick={isMobileDrawer ? handleDrawerToggle : undefined}
              >
                <span className="text-xl flex-shrink-0">
                  {link.icon}
                </span>
                <span className="text-right">
                  {link.label}
                </span>
              </Link>
            );
          }
        })}
      </nav>
    </aside>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1201,
            display: { xs: 'block', md: 'none' },
          }}
        >
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              boxShadow: 2,
            }}
          >
            <Menu />
          </IconButton>
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              backgroundColor: 'transparent',
            },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                color: 'text.secondary',
              }}
            >
              <Close />
            </IconButton>
            <NavContent isMobileDrawer={true} />
          </Box>
        </Drawer>

        {/* Mobile Sidebar (Icon Only) */}
        <NavContent />
      </>
    );
  }

  // Desktop version
  return <NavContent />;
};

export default AdminSideNav;