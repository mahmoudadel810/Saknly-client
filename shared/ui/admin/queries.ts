import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { api } from "@/shared/services/api";

/*
 * Admin data, read through the shared `api` client (auth header and 401 handling live there). Each query key
 * is shared by the page that owns the data and the dashboard, so moving between them reuses the cache.
 * Field names and status values come from server/Model and server/modules.
 */

// ---------- analytics (GET /admin/analytics, a flat object) ----------

export interface AdminAnalytics {
  userCount: number | null;
  propertyCount: number | null;
  pendingPropertyCount: number | null;
  agencyCount: number | null;
  testimonialCount: number | null;
  inquiryCount: number | null;
  contactCount: number | null;
  recentProperties: Array<{
    _id: string;
    title: string;
    category?: string;
    price?: number;
    isApproved?: boolean;
    location?: { city?: string };
    createdAt: string;
  }>;
}

const count = (value: unknown) => (typeof value === "number" ? value : null);

export const analyticsQuery = queryOptions({
  queryKey: ["admin", "analytics"],
  queryFn: async (): Promise<AdminAnalytics> => {
    const { data } = await api.get("/admin/analytics");
    return {
      userCount: count(data?.userCount),
      propertyCount: count(data?.propertyCount),
      pendingPropertyCount: count(data?.pendingPropertyCount),
      agencyCount: count(data?.agencyCount),
      testimonialCount: count(data?.testimonialCount),
      inquiryCount: count(data?.inquiryCount),
      contactCount: count(data?.contactCount),
      recentProperties: Array.isArray(data?.recentProperties) ? data.recentProperties : [],
    };
  },
  staleTime: 60_000,
});

// ---------- users (GET /users/get-all-users) ----------

export type UserRole = "user" | "admin";
/** The server's spelling, with a hyphen. */
export type UserStatus = "active" | "in-active";

export interface AdminUser {
  _id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  isConfirmed?: boolean;
  provider?: "local" | "google";
  lastLoginAt?: string;
  createdAt: string;
}

export interface Page<T> {
  rows: T[];
  total: number;
}

export const usersQuery = (params: { page: number; limit: number; search: string }) =>
  queryOptions({
    queryKey: ["admin", "users", params],
    queryFn: async (): Promise<Page<AdminUser>> => {
      const { data } = await api.get("/users/get-all-users", {
        params: { page: params.page, limit: params.limit, search: params.search || undefined },
      });
      return {
        rows: Array.isArray(data?.users) ? data.users : [],
        total: typeof data?.pagination?.totalDocs === "number" ? data.pagination.totalDocs : 0,
      };
    },
    placeholderData: keepPreviousData,
  });

// ---------- agencies (GET /agencies) ----------

export interface AdminAgency {
  _id: string;
  name: string;
  description?: string;
  logo?: { publicId?: string; url: string };
  isFeatured: boolean;
  createdAt: string;
}

export const agenciesQuery = (params: { page: number; limit: number; search: string }) =>
  queryOptions({
    queryKey: ["admin", "agencies", params],
    queryFn: async (): Promise<Page<AdminAgency>> => {
      const { data } = await api.get("/agencies", {
        params: { page: params.page, limit: params.limit, search: params.search || undefined },
      });
      return {
        rows: Array.isArray(data?.data) ? data.data : [],
        total: typeof data?.total === "number" ? data.total : 0,
      };
    },
    placeholderData: keepPreviousData,
  });

// ---------- testimonials (GET /testimonial/all?status=) ----------

export type TestimonialStatusValue = "pending" | "approved" | "rejected";

export interface AdminTestimonial {
  _id: string;
  name: string;
  text: string;
  role?: string;
  image?: string;
  type: "general" | "property" | "agency";
  status: TestimonialStatusValue;
  createdAt: string;
}

export const testimonialsQuery = (status: TestimonialStatusValue | "all") =>
  queryOptions({
    queryKey: ["admin", "testimonials", status],
    queryFn: async (): Promise<AdminTestimonial[]> => {
      const { data } = await api.get("/testimonial/all", {
        params: status === "all" ? undefined : { status },
      });
      return Array.isArray(data?.data) ? data.data : [];
    },
  });

// ---------- contact messages (GET /contact/get-all-contacts, unpaginated) ----------

export type ContactStatus = "pending" | "in-progress" | "closed";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

export const contactsQuery = queryOptions({
  queryKey: ["admin", "contacts"],
  queryFn: async (): Promise<ContactMessage[]> => {
    const { data } = await api.get("/contact/get-all-contacts");
    return Array.isArray(data?.data) ? data.data : [];
  },
});

// ---------- property inquiries (GET /property-inquiry/get-all-property-inquiries) ----------

export type InquiryStatus = "new" | "in-progress" | "responded" | "closed";

export interface PropertyInquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  isRead?: boolean;
  createdAt: string;
  property?: { _id: string; title?: string; price?: number; location?: { city?: string } } | null;
  agent?: { _id: string; userName?: string; email?: string; phone?: string } | null;
}

export const propertyInquiriesQuery = (params: {
  page: number;
  limit: number;
  status: InquiryStatus | "all";
  search: string;
}) =>
  queryOptions({
    queryKey: ["admin", "property-inquiries", params],
    queryFn: async (): Promise<Page<PropertyInquiry>> => {
      const { data } = await api.get("/property-inquiry/get-all-property-inquiries", {
        params: {
          page: params.page,
          limit: params.limit,
          status: params.status === "all" ? undefined : params.status,
          search: params.search || undefined,
        },
      });
      return {
        rows: Array.isArray(data?.data) ? data.data : [],
        total: typeof data?.pagination?.total === "number" ? data.pagination.total : 0,
      };
    },
    placeholderData: keepPreviousData,
  });

/** Published listings (GET /properties/allProperties: approved and active only, server-paginated). */
export interface PublishedProperty {
  _id: string;
  title: string;
  category: "sale" | "rent" | "student";
  price?: number;
  location?: { city?: string; address?: string };
  images?: Array<{ url: string; isMain?: boolean }>;
  owner?: { _id: string; userName?: string } | null;
  createdAt: string;
}

export const publishedPropertiesQuery = (params: { page: number; limit: number; search: string }) =>
  queryOptions({
    queryKey: ["admin", "published-properties", params],
    queryFn: async (): Promise<Page<PublishedProperty>> => {
      const { data } = await api.get("/properties/allProperties", {
        params: { page: params.page, limit: params.limit, search: params.search || undefined },
      });
      return {
        rows: Array.isArray(data?.data) ? data.data : [],
        total: typeof data?.pagination?.totalDocs === "number" ? data.pagination.totalDocs : 0,
      };
    },
    placeholderData: keepPreviousData,
  });
