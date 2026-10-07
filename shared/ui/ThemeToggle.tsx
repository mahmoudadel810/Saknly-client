"use client";

import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import { useDarkMode } from "@/app/context/DarkModeContext";

/** Light/dark switch. Before hydration the mode is unknown on both server and client, so the first render matches. */
export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const label = isDarkMode ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن";
  return (
    <Tooltip title={label}>
      <IconButton onClick={toggleDarkMode} aria-label={label} sx={{ color: "text.secondary" }}>
        {isDarkMode ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
