import type { Metadata } from "next";

// The page itself is a client component, so the canonical is set here, from the route parameter.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { alternates: { canonical: `/agencies/${encodeURIComponent(id)}` } };
}

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
