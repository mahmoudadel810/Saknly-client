"use client"
import React from "react";
import AdminSideNav from "@/shared/components/AdminSideNav";
import { Box, useTheme } from "@mui/material";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { isDarkMode } = useDarkMode();
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: isDarkMode
          ? 'linear-gradient(135deg, var(--dark-800) 0%, var(--dark-700) 100%)'
          : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}
      role="main"
    >
      <AdminSideNav aria-label="Admin navigation" />
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 3, md: 5 },
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: isDarkMode ? 'var(--dark-500)' : theme.palette.grey[300] },
          '&::-webkit-scrollbar-track': { backgroundColor: isDarkMode ? 'var(--dark-700)' : theme.palette.grey[100] },
        }}
        aria-label="Main content"
      >
        {children}
      </Box>
    </Box>
  );
} 