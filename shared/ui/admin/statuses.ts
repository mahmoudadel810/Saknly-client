import type { StatusKey } from "../StatusBadge";
import type { ContactStatus, InquiryStatus, UserStatus } from "./queries";

/** StatusBadge props for the server's status values that have no badge key of their own. */
export interface BadgeProps {
  status: StatusKey;
  label?: string;
}

export const userStatusBadge = (status: UserStatus | string | undefined): BadgeProps =>
  status === "active" ? { status: "active" } : { status: "inactive" };

export const INQUIRY_STATUS: Record<InquiryStatus, BadgeProps & { label: string }> = {
  new: { status: "pending", label: "جديد" },
  "in-progress": { status: "pending", label: "قيد المتابعة" },
  responded: { status: "approved", label: "تم الرد" },
  closed: { status: "inactive", label: "مغلق" },
};

export const CONTACT_STATUS: Record<ContactStatus, BadgeProps & { label: string }> = {
  pending: { status: "pending", label: "جديدة" },
  "in-progress": { status: "pending", label: "قيد المتابعة" },
  closed: { status: "inactive", label: "مغلقة" },
};
