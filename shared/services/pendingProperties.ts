import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { api } from "@/shared/services/api";

/** A listing waiting for moderation, as GET /properties/pending returns it (the full document). */
export interface PendingProperty {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  location?: { address?: string; city?: string; district?: string };
  area?: number;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  images?: Array<{ url: string; isMain?: boolean; alt?: string }>;
  /** The owner's notification address; deny and approve emails go here, not to the account email. */
  contactInfo?: { name?: string; phone?: string; email?: string };
  createdAt: string;
  category: "sale" | "rent" | "student";
  owner?: {
    _id: string;
    userName?: string;
    name?: string;
    email?: string;
  } | null;
}

export type PendingPropertiesByCategory = Record<"sale" | "rent" | "student", PendingProperty[]>;

export const PENDING_PROPERTIES_KEY = ["pending-properties"] as const;

/**
 * The moderation queue, shared by the admin properties page, the dashboard and the admin sidebar's pending
 * badge. One key, so all three read the same cached request.
 */
export const pendingPropertiesQuery = queryOptions({
  queryKey: PENDING_PROPERTIES_KEY,
  queryFn: async (): Promise<PendingPropertiesByCategory> => {
    // One request for every pending listing, grouped here by category (the endpoint has no pagination).
    // A failed request throws, so a 401/500 is never shown as "no pending listings".
    const { data: body } = await api.get("/properties/pending");
    const all: PendingProperty[] = Array.isArray(body?.data) ? body.data : [];

    const grouped: PendingPropertiesByCategory = { sale: [], rent: [], student: [] };
    for (const property of all) {
      grouped[property.category]?.push(property);
    }
    return grouped;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});

export const countPending = (grouped: PendingPropertiesByCategory): number =>
  grouped.sale.length + grouped.rent.length + grouped.student.length;

/** Every pending listing, newest first (the server's order within each category is kept). */
export const flattenPending = (grouped: PendingPropertiesByCategory): PendingProperty[] =>
  [...grouped.sale, ...grouped.rent, ...grouped.student].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

/** Refreshes the queue and the sidebar badge after an approve or deny. */
export const invalidatePending = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: PENDING_PROPERTIES_KEY });
