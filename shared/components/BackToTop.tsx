"use client";
import React, { useEffect, useState } from "react";
import { Fab, Tooltip } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const NAVBAR_HEIGHT = 72; // px, adjust if your navbar is taller
const SHOW_AFTER_SCROLL = 300; // px
const BOTTOM_OFFSET = 24; // px
const LEFT_OFFSET = 24; // px

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_SCROLL);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Tooltip title="العودة إلى الأعلى" placement="right" arrow>
      <span>
        <Fab
          color="primary"
          onClick={handleClick}
          sx={{
            position: "fixed",
            bottom: { xs: BOTTOM_OFFSET, md: BOTTOM_OFFSET },
            left: { xs: LEFT_OFFSET, md: LEFT_OFFSET },
            zIndex: 1300,
            boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? 'auto' : 'none',
            transition: 'opacity 0.4s cubic-bezier(.4,0,.2,1)',
            backgroundColor: '#fff',
            color: 'var(--primary-600)',
            border: '2px solid var(--primary-600)',
            '&:hover': {
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-700)',
              borderColor: 'var(--primary-700)',
            },
          }}
          aria-label="العودة إلى الأعلى"
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 32, fontWeight: 900 }} />
        </Fab>
      </span>
    </Tooltip>
  );
};

export default BackToTop; 