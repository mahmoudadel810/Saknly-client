"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import { api } from "@/shared/services/api";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import AgencyLogo from "@/shared/ui/listing/AgencyLogo";
import HomeSection from "./HomeSection";

export interface FeaturedAgency {
  _id: string;
  name: string;
  logo?: { url?: string };
  description?: string;
}

const fetchFeaturedAgencies = async (): Promise<FeaturedAgency[]> => {
  const res = await api.get("/agencies/featured");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

function AgencyTile({ agency }: { agency: FeaturedAgency }) {
  return (
    <Box
      component={Link}
      href={`/agencies/${agency._id}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: "100%",
        p: 2.5,
        border: 1,
        borderColor: "divider",
        borderRadius: "var(--r-card)",
        bgcolor: "background.paper",
        boxShadow: "var(--c-card-shadow)",
        color: "text.primary",
        textDecoration: "none",
        transition: "transform 200ms ease-out, box-shadow 200ms ease-out",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "var(--c-card-shadow-hover)" },
        "&:hover .agency-tile__arrow": { color: "primary.main", transform: "translateX(-2px)" },
        "@media (prefers-reduced-motion: reduce)": {
          "&:hover": { transform: "none" },
          "&:hover .agency-tile__arrow": { transform: "none" },
        },
      }}
    >
      <AgencyLogo src={agency.logo?.url} size={64} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography component="h3" variant="h6" sx={{ lineHeight: 1.4, fontWeight: 700 }}>
          {agency.name}
        </Typography>
        {agency.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {agency.description}
          </Typography>
        )}
      </Box>
      <ArrowBackOutlined
        aria-hidden
        className="agency-tile__arrow"
        sx={{ flexShrink: 0, fontSize: 20, color: "text.secondary", transition: "color 150ms ease-out, transform 150ms ease-out" }}
      />
    </Box>
  );
}

/**
 * Featured agencies, each linking to its page. With no featured agency the whole band is left out: an empty
 * "agencies" box on the home page tells a visitor nothing.
 */
export default function FeaturedAgencies() {
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["agencies", "featured"],
    queryFn: fetchFeaturedAgencies,
  });

  if (!isPending && !isError && data.length === 0) return null;

  return (
    <HomeSection
      id="home-agencies"
      title="شركات عقارية على سكنلي"
      description="تصفح إعلانات كل شركة في صفحتها."
      tone="page"
    >
      {isPending ? (
        <LoadingState compact label="جاري تحميل الشركات" />
      ) : isError ? (
        <ErrorState compact title="تعذر تحميل الشركات" onRetry={() => refetch()} retrying={isFetching} />
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((agency) => (
            <li key={agency._id}>
              <AgencyTile agency={agency} />
            </li>
          ))}
        </ul>
      )}
    </HomeSection>
  );
}
