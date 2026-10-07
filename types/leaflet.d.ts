declare global {
  interface Window {
    // Leaflet, loaded from unpkg on demand (shared/ui/listing/leaflet.ts, shared/components/MapPicker.tsx).
    L: any;
  }
}

export {}; 