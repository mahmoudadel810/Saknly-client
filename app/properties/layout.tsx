import type { Metadata } from "next";

// Filtered and paginated browse URLs all point at the plain list. /properties/[id] sets its own canonical.
export const metadata: Metadata = {
  alternates: { canonical: "/properties" },
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
