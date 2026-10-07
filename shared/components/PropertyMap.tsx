"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatPrice } from "@/shared/ui/Price";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import { hasCoordinates, loadLeaflet, markerHtml, readToken } from "@/shared/ui/listing/leaflet";

export interface MapListing {
  _id: string;
  title?: string;
  price?: number | null;
  category?: string;
  location?: { address?: string; city?: string; latitude?: number | null; longitude?: number | null } | null;
}

// The centre of Menoufia, where the listed cities are; used only when no listing on the page has a location.
const DEFAULT_CENTER: [number, number] = [30.55, 31.0];

/** Popup content built from DOM nodes with textContent, so listing fields can never be parsed as HTML. */
function popupContent(listing: MapListing): HTMLElement {
  const root = document.createElement("div");
  root.setAttribute("dir", "rtl");
  root.style.cssText = "min-width:180px;font-family:inherit";
  const title = document.createElement("a");
  title.href = `/properties/${encodeURIComponent(listing._id)}`;
  title.textContent = listing.title || "إعلان";
  title.style.cssText = "display:block;font-weight:600;margin-bottom:4px;color:var(--c-primary)";
  root.append(title);
  if (typeof listing.price === "number") {
    const price = document.createElement("div");
    price.textContent = formatPrice(listing.price, listing.category);
    price.style.cssText = "font-weight:700;font-variant-numeric:tabular-nums";
    root.append(price);
  }
  const where = [listing.location?.address, listing.location?.city].filter(Boolean).join("، ");
  if (where) {
    const p = document.createElement("div");
    p.textContent = where;
    p.style.cssText = "color:var(--c-text-2);font-size:12px;margin-top:2px";
    root.append(p);
  }
  return root;
}

/**
 * The browse page's map view: one marker per listing on the current page that has real coordinates.
 * Listings without a location are not placed (they used to get invented coordinates around Cairo).
 */
export default function PropertyMap({ properties }: { properties: MapListing[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  const located = properties.filter((p) => hasCoordinates(p.location));

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        if (!mapRef.current) {
          mapRef.current = L.map(containerRef.current, { scrollWheelZoom: false }).setView(DEFAULT_CENTER, 10);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(mapRef.current);
          layerRef.current = L.layerGroup().addTo(mapRef.current);
        }
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (status !== "ready" || !window.L || !mapRef.current) return;
    const L = window.L;
    const layer = layerRef.current;
    layer.clearLayers();
    const icon = L.divIcon({
      html: markerHtml(readToken("--c-primary", "CanvasText"), readToken("--c-surface", "Canvas")),
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const points: [number, number][] = [];
    located.forEach((listing) => {
      const point: [number, number] = [listing.location!.latitude as number, listing.location!.longitude as number];
      points.push(point);
      L.marker(point, { icon, title: listing.title || "إعلان", alt: listing.title || "إعلان" })
        .bindPopup(popupContent(listing))
        .addTo(layer);
    });
    if (points.length === 1) mapRef.current.setView(points[0], 14);
    else if (points.length > 1) mapRef.current.fitBounds(points, { padding: [32, 32], maxZoom: 15 });
    // `located` is derived from `properties`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, properties]);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} aria-live="polite">
        {located.length === properties.length
          ? "كل إعلانات هذه الصفحة على الخريطة."
          : `${located.length} من ${properties.length} إعلانات هذه الصفحة لها موقع على الخريطة.`}
      </Typography>
      <Box
        sx={{
          position: "relative",
          height: { xs: 420, md: 560 },
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
          overflow: "hidden",
          bgcolor: "var(--c-bg)",
        }}
      >
        <Box ref={containerRef} role="region" aria-label="خريطة الإعلانات" sx={{ position: "absolute", inset: 0 }} />
        {status !== "ready" && (
          <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", bgcolor: "background.paper" }}>
            {status === "loading" ? (
              <LoadingState compact label="جاري تحميل الخريطة" />
            ) : (
              <ErrorState compact title="تعذر تحميل الخريطة" onRetry={() => setAttempt((n) => n + 1)} />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
