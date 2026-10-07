"use client";

import RouteError, { type RouteErrorProps } from "@/shared/ui/RouteError";

/** Inside the root layout, so the header and footer stay usable when a page fails to render. */
export default function AppError(props: Pick<RouteErrorProps, "error" | "reset">) {
  return <RouteError {...props} />;
}
