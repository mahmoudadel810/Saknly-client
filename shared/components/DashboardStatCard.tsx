import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

const DashboardStatCard = ({
  title,
  value,
  icon,
  color = "primary.light",
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color?: string;
}) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: "background.paper",
      boxShadow: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderLeft: `4px solid`,
      borderColor: color,
    }}
  >
    <Box sx={{ color, mb: 1 }}>{icon}</Box>
    <Typography variant="h5" fontWeight="bold">
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
  </Box>
);

export default DashboardStatCard;
