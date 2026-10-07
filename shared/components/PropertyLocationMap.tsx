"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import { loadLeaflet, markerHtml, readToken } from "@/shared/ui/listing/leaflet";

interface PropertyLocationMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

/**
 * One listing on an OpenStreetMap map, plus a link that opens directions in Google Maps. The map does not
 * ask for the visitor's location: directions are Google's job, and only when asked.
 */
export default function PropertyLocationMap({ latitude, longitude, title }: PropertyLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        mapRef.current?.remove();
        const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([latitude, longitude], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);
        const icon = L.divIcon({
          html: markerHtml(readToken("--c-primary", "CanvasText"), readToken("--c-surface", "Canvas"), 32),
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        L.marker([latitude, longitude], { icon, title, alt: title }).addTo(map);
        mapRef.current = map;
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, title, attempt]);

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          height: { xs: 260, md: 340 },
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
          overflow: "hidden",
          bgcolor: "var(--c-bg)",
        }}
      >
        <Box ref={containerRef} role="region" aria-label={`موقع ${title} على الخريطة`} sx={{ position: "absolute", inset: 0 }} />
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
      <Button
        component="a"
        href={directions}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<DirectionsOutlined aria-hidden />}
        sx={{ mt: 1, px: 1 }}
      >
        الاتجاهات في خرائط Google
      </Button>
    </Box>
  );
}
