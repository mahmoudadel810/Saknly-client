"use client";

import RouteError, { type RouteErrorProps } from "@/shared/ui/RouteError";

export default function PropertyError(props: Pick<RouteErrorProps, "error" | "reset">) {
  return (
    <RouteError
      {...props}
      title="تعذّر عرض هذا العقار"
      description="حاول مرة أخرى، أو ارجع إلى قائمة العقارات."
      homeHref="/properties"
      homeLabel="كل العقارات"
    />
  );
}
