"use client";

import RouteError, { type RouteErrorProps } from "@/shared/ui/RouteError";

/** Inside the admin layout, so the admin sidebar stays usable. */
export default function AdminError(props: Pick<RouteErrorProps, "error" | "reset">) {
  return (
    <RouteError
      {...props}
      title="تعذّر عرض هذه الصفحة"
      description="حاول مرة أخرى. إن تكرر الخطأ، ارجع إلى لوحة التحكم."
      homeHref="/admin/dashboard"
      homeLabel="لوحة التحكم"
      landmark={false}
    />
  );
}
