import React from "react";
import Box from "@mui/material/Box";
import SquareFootOutlined from "@mui/icons-material/SquareFootOutlined";
import BedOutlined from "@mui/icons-material/BedOutlined";
import BathtubOutlined from "@mui/icons-material/BathtubOutlined";
import { formatNumber } from "./Price";

const roomsLabel = (n: number) => (n === 1 ? "غرفة" : n === 2 ? "غرفتان" : n <= 10 ? "غرف" : "غرفة");
const bathsLabel = (n: number) => (n === 1 ? "حمام" : n === 2 ? "حمامان" : n <= 10 ? "حمامات" : "حمام");

const isCount = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;

export interface ListingFactsProps {
  /** Square metres (the server stores a number). */
  area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: "card" | "detail";
}

/**
 * The area, rooms and baths line, identical on cards, the detail page and admin tables. Missing or zero facts
 * are left out (a shop has no bedrooms) rather than shown as 0.
 */
export default function ListingFacts({ area, bedrooms, bathrooms, size = "card" }: ListingFactsProps) {
  const facts: { key: string; icon: React.ReactNode; text: string }[] = [];
  if (isCount(area)) facts.push({ key: "area", icon: <SquareFootOutlined />, text: `${formatNumber(area)} م²` });
  if (isCount(bedrooms)) facts.push({ key: "rooms", icon: <BedOutlined />, text: `${bedrooms} ${roomsLabel(bedrooms)}` });
  if (isCount(bathrooms)) facts.push({ key: "baths", icon: <BathtubOutlined />, text: `${bathrooms} ${bathsLabel(bathrooms)}` });
  if (facts.length === 0) return null;

  return (
    <Box
      component="ul"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: size === "detail" ? 3 : 2,
        rowGap: 0.5,
        m: 0,
        p: 0,
        listStyle: "none",
        color: "text.secondary",
        fontSize: size === "detail" ? "0.9375rem" : "0.8125rem",
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {facts.map((fact) => (
        <Box component="li" key={fact.key} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <Box component="span" aria-hidden sx={{ display: "flex", "& svg": { fontSize: size === "detail" ? 20 : 16 } }}>
            {fact.icon}
          </Box>
          {fact.text}
        </Box>
      ))}
    </Box>
  );
}
