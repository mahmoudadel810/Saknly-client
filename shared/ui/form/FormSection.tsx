import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface FormSectionProps {
  id: string;
  /** Shown before the title: "1". */
  step?: number;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

/** One titled panel of a long form: number, h2, a line of guidance, then the fields. */
export default function FormSection({ id, step, title, description, children }: FormSectionProps) {
  return (
    <Box
      component="section"
      id={id}
      aria-labelledby={`${id}-title`}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: "10px",
        bgcolor: "background.paper",
        p: { xs: 2, md: 3 },
        scrollMarginTop: 80,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2.5 }}>
        {step !== undefined && (
          <Box
            aria-hidden
            className="num"
            sx={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: "6px",
              display: "grid",
              placeItems: "center",
              bgcolor: "var(--c-primary-soft)",
              color: "primary.main",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            {step}
          </Box>
        )}
        <div>
          <Typography id={`${id}-title`} component="h2" variant="h5">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {description}
            </Typography>
          )}
        </div>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>{children}</Box>
    </Box>
  );
}

/** A responsive row of fields: one column on phones, `columns` from md. */
export function FieldRow({ children, columns = 2 }: { children: ReactNode; columns?: 2 | 3 }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2.5,
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: `repeat(${columns}, minmax(0, 1fr))` },
        alignItems: "start",
      }}
    >
      {children}
    </Box>
  );
}
