"use client";

import React, { useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import { canOptimize } from "@/shared/ui/PropertyCard";

/**
 * An agency logo in a bordered square on the surface colour (logos are usually drawn for a white page, so
 * `contain` keeps them whole). A missing or broken logo shows a building icon. Decorative: the agency name
 * is always next to it.
 */
export default function AgencyLogo({ src, size = 56 }: { src?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <Box
      aria-hidden
      sx={{
        position: "relative",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "10px",
        border: 1,
        borderColor: "divider",
        bgcolor: "var(--c-surface)",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        color: "var(--c-muted)",
      }}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          style={{ objectFit: "contain", padding: Math.round(size / 10) }}
          unoptimized={!canOptimize(src)}
          onError={() => setFailed(true)}
        />
      ) : (
        <ApartmentOutlined sx={{ fontSize: Math.round(size / 2) }} />
      )}
    </Box>
  );
}
