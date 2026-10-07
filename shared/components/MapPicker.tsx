"use client";

import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MyLocationOutlined from "@mui/icons-material/MyLocationOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";

/* eslint-disable @typescript-eslint/no-explicit-any -- Leaflet is loaded from a CDN at runtime, without types. */
// window.L is declared in types/leaflet.d.ts.

export interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

// LocationIQ's public browser key (third-party geocoder; kept as it was, restrict it by referrer in LocationIQ).
const LOCATIONIQ_API_KEY = "pk.d8d051bc7be4dacd5916e32712deaa39";
const LEAFLET = "https://unpkg.com/leaflet@1.9.4/dist/leaflet";

let leafletPromise: Promise<any> | null = null;

/** Loads Leaflet's CSS and JS once per page. */
function loadLeaflet(): Promise<any> {
  if (window.L) return Promise.resolve(window.L);
  if (!leafletPromise) {
    leafletPromise = new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `${LEAFLET}.css`;
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = `${LEAFLET}.js`;
      script.onload = () => resolve(window.L);
      script.onerror = () => {
        leafletPromise = null;
        reject(new Error("leaflet failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return leafletPromise;
}

// A pin in the primary token colour (inline SVG, so it follows light and dark mode).
const PIN_HTML = `<svg width="32" height="40" viewBox="0 0 32 40" aria-hidden="true" style="display:block;filter:drop-shadow(0 1px 2px rgb(0 0 0 / .35))">
  <path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 40 16 40s16-12.5 16-24.3C32 7 24.8 0 16 0z" fill="var(--c-primary)"/>
  <circle cx="16" cy="15.5" r="6" fill="var(--c-surface)"/></svg>`;

/**
 * Pick the listing's position: click the map, drag the pin, search a place (LocationIQ) or use the device
 * location. Every change is reported through onLocationSelect. Loaded with next/dynamic by the form.
 */
export default function MapPicker({ latitude = 30.5546, longitude = 31.0117, onLocationSelect }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onSelectRef = useRef(onLocationSelect);
  onSelectRef.current = onLocationSelect;

  const [position, setPosition] = useState({ lat: latitude, lng: longitude });
  const [mapState, setMapState] = useState<"loading" | "ready" | "failed">("loading");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // One marker, kept in a ref: every click, drag or search moves the same pin.
  const placePin = (lat: number, lng: number, pan = false) => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map) return;
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    else {
      const icon = L.divIcon({ html: PIN_HTML, className: "", iconSize: [32, 40], iconAnchor: [16, 40] });
      markerRef.current = L.marker([lat, lng], { icon, draggable: true, keyboard: true, title: "موقع العقار" }).addTo(
        map,
      );
      markerRef.current.on("dragend", () => {
        const p = markerRef.current.getLatLng();
        setPosition({ lat: p.lat, lng: p.lng });
        onSelectRef.current(p.lat, p.lng);
      });
    }
    if (pan) map.setView([lat, lng], Math.max(map.getZoom(), 16));
    setPosition({ lat, lng });
    onSelectRef.current(lat, lng);
  };

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const map = L.map(containerRef.current).setView([latitude, longitude], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);
        mapRef.current = map;
        const icon = L.divIcon({ html: PIN_HTML, className: "", iconSize: [32, 40], iconAnchor: [16, 40] });
        markerRef.current = L.marker([latitude, longitude], {
          icon,
          draggable: true,
          keyboard: true,
          title: "موقع العقار",
        }).addTo(map);
        markerRef.current.on("dragend", () => {
          const p = markerRef.current.getLatLng();
          setPosition({ lat: p.lat, lng: p.lng });
          onSelectRef.current(p.lat, p.lng);
        });
        map.on("click", (e: any) => placePin(e.latlng.lat, e.latlng.lng));
        // The dialog animates open; measure again once it has its final size.
        setTimeout(() => map.invalidateSize(), 250);
        setMapState("ready");
      })
      .catch(() => !cancelled && setMapState("failed"));
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Initialise once; later position changes go through placePin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = async () => {
    const q = query.trim();
    if (!q || searching) return;
    setSearching(true);
    setMessage(null);
    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(q)}&countrycodes=eg&accept-language=ar&format=json&limit=1`,
      );
      const data = res.ok ? await res.json() : [];
      if (Array.isArray(data) && data.length > 0) placePin(parseFloat(data[0].lat), parseFloat(data[0].lon), true);
      else setMessage("لم نجد هذا المكان. جرّب اسم الشارع أو منطقة قريبة، أو حدّد الموقع على الخريطة.");
    } catch {
      setMessage("تعذّر البحث الآن. حدّد الموقع بالضغط على الخريطة.");
    } finally {
      setSearching(false);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setMessage("متصفحك لا يدعم تحديد الموقع. حدّد الموقع بالضغط على الخريطة.");
      return;
    }
    setLocating(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        placePin(pos.coords.latitude, pos.coords.longitude, true);
      },
      (err) => {
        setLocating(false);
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? "لم تسمح بالوصول إلى موقعك. اسمح به من إعدادات المتصفح، أو حدّد الموقع على الخريطة."
            : "تعذّر تحديد موقعك الآن. حدّد الموقع بالضغط على الخريطة.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}>
      {/* Not a <form>: the picker opens inside the listing form, and a nested submit would publish it. */}
      <Box role="search" sx={{ display: "flex", alignItems: "flex-end", gap: 1, flexWrap: "wrap" }}>
        <TextField
          label="ابحث عن مكان"
          placeholder="مثال: شارع الجمهورية، شبين الكوم"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              search();
            }
          }}
          sx={{ flex: "1 1 220px" }}
        />
        <Button
          onClick={search}
          variant="outlined"
          disabled={searching || !query.trim()}
          startIcon={searching ? <CircularProgress size={16} color="inherit" aria-hidden /> : <SearchOutlined />}
          sx={{ height: 44 }}
        >
          بحث
        </Button>
        <Button
          onClick={locate}
          variant="outlined"
          color="inherit"
          disabled={locating || mapState !== "ready"}
          startIcon={locating ? <CircularProgress size={16} color="inherit" aria-hidden /> : <MyLocationOutlined />}
          sx={{ height: 44 }}
        >
          موقعي الحالي
        </Button>
      </Box>

      <div aria-live="polite">
        {message && (
          <Alert severity="warning" variant="outlined" onClose={() => setMessage(null)}>
            {message}
          </Alert>
        )}
      </div>

      <Box
        sx={{
          position: "relative",
          flex: 1,
          minHeight: { xs: 320, md: 420 },
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
          overflow: "hidden",
          bgcolor: "var(--c-surface-2)",
        }}
      >
        <Box
          ref={containerRef}
          sx={{ position: "absolute", inset: 0 }}
          aria-label="خريطة لاختيار موقع العقار"
          role="region"
        />
        {mapState !== "ready" && (
          <Box
            sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", p: 2, textAlign: "center" }}
          >
            {mapState === "loading" ? (
              <CircularProgress size={28} aria-label="جارٍ تحميل الخريطة" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                تعذّر تحميل الخريطة. تحقق من اتصالك، أو اترك الموقع كما هو وأكمل النموذج.
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" component="p">
        اضغط على الخريطة أو اسحب العلامة لتحديد مكان العقار. الإحداثيات:{" "}
        <span dir="ltr" className="num">
          {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </span>
      </Typography>
    </Box>
  );
}
