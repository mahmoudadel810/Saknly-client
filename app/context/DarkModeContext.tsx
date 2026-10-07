"use client";

import React from 'react';
import { useColorScheme } from '@mui/material/styles';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * Thin wrapper over MUI's color scheme (AppThemeProvider owns the mode, its storage and the `.dark`/`.light`
 * class on <html>). Kept so existing callers compile; new code should read theme tokens instead.
 * Before hydration `mode` is undefined, so isDarkMode is false on server and client alike.
 */
export const useDarkMode = (): DarkModeContextType => {
  const { mode, systemMode, setMode } = useColorScheme();
  const effective = mode === 'system' ? systemMode : mode;
  const isDarkMode = effective === 'dark';
  const toggleDarkMode = () => setMode(isDarkMode ? 'light' : 'dark');
  return { isDarkMode, toggleDarkMode };
};

/** No longer holds state; kept so the existing provider tree compiles. */
export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
