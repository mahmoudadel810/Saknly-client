import React from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";

// Hosts allowed by next.config.mjs images.remotePatterns; anything else is shown unoptimized.
const OPTIMIZED_HOSTS = ["res.cloudinary.com", "images.unsplash.com"];

const canOptimize = (src: string) => {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
};

export const mainImageUrl = (images?: Array<{ url: string; isMain?: boolean }> | null) =>
  (images?.find((img) => img.isMain) ?? images?.[0])?.url;

/** A 4:3 listing thumbnail for admin tables (64×48), with a quiet placeholder when there is no photo. */
export default function ListingThumb({
  images,
  alt,
}: {
  images?: Array<{ url: string; isMain?: boolean }> | null;
  alt: string;
}) {
  const src = mainImageUrl(images);
  return (
    <Box
      sx={{
        position: "relative",
        width: 64,
        height: 48,
        flexShrink: 0,
        borderRadius: "6px",
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        bgcolor: "var(--c-bg)",
        display: "grid",
        placeItems: "center",
        color: "var(--c-muted)",
      }}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="64px" style={{ objectFit: "cover" }} unoptimized={!canOptimize(src)} />
      ) : (
        <HomeWorkOutlined fontSize="small" aria-hidden />
      )}
    </Box>
  );
}
