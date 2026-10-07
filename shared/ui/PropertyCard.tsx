"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import Favorite from "@mui/icons-material/Favorite";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import { useWishlist } from "@/app/context/WishlistContext";
import ListingTypeTag from "./ListingTypeTag";
import ListingFacts from "./ListingFacts";
import Price from "./Price";

export interface PropertyCardImage {
  url: string;
  publicId?: string;
  isMain?: boolean;
}

/** What the card shows. Build it from an API listing or a wishlist item with toPropertyCardData. */
export interface PropertyCardData {
  id: string;
  title: string;
  price: number | null;
  /** sale | rent | student */
  category: string;
  type?: string;
  area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  location?: { address?: string; city?: string; district?: string };
  images: PropertyCardImage[];
}

/** The shapes the card receives today: API listings (`_id`) and WishlistContext items (`id`). */
export interface ListingLike {
  _id?: string;
  id?: string;
  title?: string;
  price?: number | string | null;
  category?: string;
  type?: string;
  area?: number | string | { total?: number } | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  location?: { address?: string; city?: string; district?: string } | null;
  images?: Array<PropertyCardImage | string> | null;
}

const toNumber = (value: unknown): number | null => {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

export function toPropertyCardData(listing: ListingLike): PropertyCardData {
  const area =
    listing.area && typeof listing.area === "object" ? toNumber(listing.area.total) : toNumber(listing.area);
  return {
    id: String(listing._id ?? listing.id ?? ""),
    title: listing.title ?? "",
    price: toNumber(listing.price),
    category: listing.category ?? "",
    type: listing.type,
    area,
    bedrooms: toNumber(listing.bedrooms),
    bathrooms: toNumber(listing.bathrooms),
    location: listing.location ?? undefined,
    images: (listing.images ?? [])
      .map((img) => (typeof img === "string" ? { url: img } : img))
      .filter((img): img is PropertyCardImage => Boolean(img?.url)),
  };
}

// next.config.mjs images.remotePatterns. Any other host is shown unoptimized instead of throwing.
const OPTIMIZED_HOSTS = ["res.cloudinary.com", "images.unsplash.com"];

export const canOptimize = (src: string) => {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
};

const mainImage = (images: PropertyCardImage[]) => (images.find((img) => img.isMain) ?? images[0])?.url;

const locationText = (location: PropertyCardData["location"]) =>
  [location?.district || location?.address, location?.city].filter(Boolean).join("، ");

interface WishlistApi {
  isInWishlist: (id: string) => boolean;
  addToWishlist: (item: Record<string, unknown>) => Promise<boolean>;
  removeFromWishlist: (id: string) => Promise<boolean>;
}

export function FavoriteToggle({ property }: { property: PropertyCardData }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist() as WishlistApi;
  const [pending, setPending] = useState(false);
  const saved = isInWishlist(property.id);

  const toggle = async () => {
    if (pending) return;
    setPending(true);
    try {
      if (saved) {
        await removeFromWishlist(property.id);
      } else {
        // The real title (AUDIT F-18: the browse card used to send the description as the title).
        await addToWishlist({
          id: property.id,
          title: property.title,
          price: property.price,
          location: property.location,
          images: property.images,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          type: property.type,
          category: property.category,
        });
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <IconButton
      size="small"
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? `إزالة «${property.title}» من المفضلة` : `حفظ «${property.title}» في المفضلة`}
      sx={{
        width: 36,
        height: 36,
        bgcolor: "var(--c-surface)",
        border: 1,
        borderColor: "divider",
        color: saved ? "error.main" : "text.secondary",
        "&:hover": { bgcolor: "var(--c-surface)", borderColor: "color-mix(in srgb, var(--c-secondary) 40%, transparent)" },
        "&.Mui-disabled": { bgcolor: "var(--c-surface)", color: saved ? "error.main" : "text.secondary", opacity: 0.7 },
      }}
    >
      {saved ? <Favorite fontSize="small" /> : <FavoriteBorderOutlined fontSize="small" />}
    </IconButton>
  );
}

export interface PropertyCardProps {
  property: PropertyCardData;
  /** "grid" (default): image on top, for card grids. "compact": a small image at the start, for lists. */
  variant?: "grid" | "compact";
  /** Load the image eagerly (the first cards above the fold). */
  priority?: boolean;
  /** Hide the favorite toggle (e.g. the owner's own listings). */
  showFavorite?: boolean;
  /** Extra controls at the bottom of the card, above the card link (e.g. share). */
  actions?: React.ReactNode;
}

/**
 * The one listing card (DESIGN-SYSTEM.md, Components): 4:3 image with the type tag at its top-start corner,
 * the price as the bold line, a two-line title, the location, the facts row and a favorite toggle. The title
 * link covers the whole card; the toggle and `actions` sit above it.
 */
export default function PropertyCard({
  property,
  variant = "grid",
  priority = false,
  showFavorite = true,
  actions,
}: PropertyCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const compact = variant === "compact";
  const src = mainImage(property.images);
  const where = locationText(property.location);

  return (
    <Box
      component="article"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: compact ? "row" : "column",
        height: "100%",
        border: 1,
        borderColor: "divider",
        borderRadius: "10px",
        bgcolor: "background.paper",
        overflow: "hidden",
        transition: "border-color 150ms ease-out",
        "&:hover": { borderColor: "color-mix(in srgb, var(--c-secondary) 40%, transparent)" },
      }}
    >
      <Box
        sx={{
          position: "relative",
          flexShrink: 0,
          width: compact ? 112 : "100%",
          aspectRatio: "4 / 3",
          alignSelf: compact ? "flex-start" : undefined,
          m: compact ? 1.5 : 0,
          marginInlineEnd: compact ? 0 : undefined,
          borderRadius: compact ? "6px" : 0,
          overflow: "hidden",
          bgcolor: "var(--c-bg)",
        }}
      >
        {src && !imageFailed ? (
          <Image
            src={src}
            alt=""
            fill
            sizes={compact ? "112px" : "(min-width: 1280px) 300px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            style={{ objectFit: "cover" }}
            priority={priority}
            unoptimized={!canOptimize(src)}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Box
            aria-hidden
            sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--c-muted)" }}
          >
            <HomeWorkOutlined sx={{ fontSize: compact ? 28 : 40 }} />
          </Box>
        )}
        {!compact && (
          <Box sx={{ position: "absolute", top: 12, insetInlineStart: 12, display: "flex" }}>
            <ListingTypeTag category={property.category} />
          </Box>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          p: compact ? 1.5 : 2,
          paddingInlineEnd: compact && showFavorite ? 6 : undefined,
        }}
      >
        <Typography
          component="h3"
          variant="h6"
          sx={{
            fontSize: compact ? "0.9375rem" : "1rem",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <Box
            component={Link}
            href={`/properties/${property.id}`}
            sx={{
              color: "inherit",
              textDecoration: "none",
              "&::after": { content: '""', position: "absolute", inset: 0, borderRadius: "10px" },
              "&:focus-visible": { outline: "none" },
              "&:focus-visible::after": { outline: "2px solid var(--c-primary)", outlineOffset: "-2px" },
              "&:hover": { color: "primary.main" },
            }}
          >
            {property.title || property.type || "عقار"}
          </Box>
        </Typography>

        {/* Visually first: the price is the card's bold line; in the DOM the heading comes first. */}
        <Box sx={{ order: -1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Price amount={property.price} category={property.category} size="card" />
          {compact && <ListingTypeTag category={property.category} />}
        </Box>

        {where && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}
          >
            <LocationOnOutlined aria-hidden sx={{ fontSize: 16, flexShrink: 0 }} />
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {where}
            </Box>
          </Typography>
        )}

        <Box sx={{ mt: compact ? 0 : 0.5 }}>
          <ListingFacts area={property.area} bedrooms={property.bedrooms} bathrooms={property.bathrooms} />
        </Box>

        {actions && (
          <Box sx={{ position: "relative", zIndex: 1, mt: "auto", pt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {actions}
          </Box>
        )}
      </Box>

      {showFavorite && property.id && (
        <Box sx={{ position: "absolute", zIndex: 1, top: compact ? 8 : 10, insetInlineEnd: compact ? 8 : 10 }}>
          <FavoriteToggle property={property} />
        </Box>
      )}
    </Box>
  );
}
