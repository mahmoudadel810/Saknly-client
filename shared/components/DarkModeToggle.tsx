"use client";

import React from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg 
                 bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600
                 transition-colors duration-200 focus:outline-none focus:ring-2 
                 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <SunIcon 
          className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 ${
            isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <MoonIcon 
          className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300 ${
            isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  );
};

export default DarkModeToggle;
