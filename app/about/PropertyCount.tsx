"use client";

import { useQuery } from "@tanstack/react-query";
import Skeleton from "@mui/material/Skeleton";
import { api } from "@/shared/services/api";

/** The number of published listings, from GET /properties/allProperties (pagination.totalDocs). */
export default function PropertyCount() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["properties", "count"],
    queryFn: async () => {
      const res = await api.get("/properties/allProperties", { params: { limit: 1 } });
      const total = res.data?.pagination?.totalDocs ?? res.data?.count;
      return typeof total === "number" ? total : null;
    },
  });

  if (isPending) return <Skeleton variant="text" width={160} aria-label="جارٍ تحميل عدد العقارات" />;
  // The count is a side note on this page: on failure the sentence is left out rather than shown wrong.
  if (isError || data == null) return null;
  return (
    <p>
      يعرض سكنلي الآن <strong className="num">{data.toLocaleString("en-US")}</strong> عقارًا منشورًا.
    </p>
  );
}
