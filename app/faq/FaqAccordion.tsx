"use client";

import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";

export interface Faq {
  question: string;
  answer: string;
}

/** One bordered list of questions; one answer open at a time. Each question is an h2 button (MUI wires aria). */
export default function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number | false>(false);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: "var(--r-card)",
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: "var(--c-card-shadow)",
      }}
    >
      {items.map((item, index) => (
        <Accordion
          key={item.question}
          expanded={open === index}
          onChange={(_, expanded) => setOpen(expanded ? index : false)}
          disableGutters
          square
          elevation={0}
          slotProps={{ heading: { component: "h2" } }}
          sx={{
            border: 0,
            bgcolor: "transparent",
            "&::before": { display: "none" },
            "& + &": { borderTop: 1, borderColor: "divider" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreOutlined />}
            id={`faq-${index}-question`}
            aria-controls={`faq-${index}-answer`}
            sx={{
              px: { xs: 2, md: 3 },
              minHeight: 60,
              transition: "background-color 150ms ease-out",
              "&:hover": { bgcolor: "var(--c-surface-2)" },
              "& .MuiAccordionSummary-content": { my: 1.75 },
              "& .MuiAccordionSummary-expandIconWrapper": { color: "text.secondary" },
              "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": { color: "primary.main" },
            }}
          >
            <Typography component="span" sx={{ fontWeight: 600, fontSize: "1rem" }}>
              {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pt: 0, pb: 2.5 }}>
            <Typography variant="body1" color="text.secondary">
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
