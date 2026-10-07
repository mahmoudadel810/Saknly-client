/**
 * Loads Leaflet 1.9.4 from unpkg once per page and resolves with `window.L`. The maps load it only when they
 * mount (they are next/dynamic, client-only), so pages without a map never download it.
 */
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

let loading: Promise<any> | null = null;

export function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Leaflet needs a browser"));
  if (window.L) return Promise.resolve(window.L);
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => (window.L ? resolve(window.L) : reject(new Error("Leaflet did not load")));
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Leaflet did not load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** Reads a design token for map markers, which are plain HTML outside React and the MUI theme. */
export function readToken(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** A round marker in the token colour, with a surface-coloured ring so it reads on any map tile. */
export function markerHtml(color: string, ring: string, size = 28): string {
  return `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid ${ring};box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`;
}

export const hasCoordinates = (location?: { latitude?: number | null; longitude?: number | null } | null) =>
  typeof location?.latitude === "number" &&
  typeof location?.longitude === "number" &&
  Number.isFinite(location.latitude) &&
  Number.isFinite(location.longitude);
