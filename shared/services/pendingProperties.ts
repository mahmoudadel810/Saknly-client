import { queryOptions } from "@tanstack/react-query";
import { authHeader } from "@/shared/utils/auth";
import { API_URL } from "@/shared/services/api";

/** A listing waiting for moderation, as GET /properties/pending returns it. */
export interface PendingProperty {
  _id: string;
  title: string;
  description?: string;
  location?: { address?: string };
  area?: number;
  price?: number;
  createdAt: string;
  category: "sale" | "rent" | "student";
  owner?: {
    _id: string;
    userName?: string;
    name?: string;
    email?: string;
  };
}

export type PendingPropertiesByCategory = Record<"sale" | "rent" | "student", PendingProperty[]>;

/**
 * The moderation queue, shared by the admin properties page and the admin sidebar's pending badge. One key,
 * so both read the same cached request.
 */
export const pendingPropertiesQuery = queryOptions({
  queryKey: ["pending-properties"],
  queryFn: async (): Promise<PendingPropertiesByCategory> => {
    // One request for every pending listing, grouped here by category
    // (the endpoint has no pagination, so splitting by category only tripled the calls).
    const res = await fetch(`${API_URL}/properties/pending`, {
      headers: authHeader(),
    });
    // A 401/500 must not be shown as "no pending properties".
    if (!res.ok) throw new Error(`Failed to load pending properties (${res.status})`);
    const body = await res.json();
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
