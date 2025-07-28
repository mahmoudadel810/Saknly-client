import { Chip } from "@mui/material";

const PropertyStatusBadge = ({ isApproved }: { isApproved: boolean }) => (
  <Chip
    label={isApproved ? "مقبولة" : "قيد المراجعة"}
    color={isApproved ? "success" : "warning"}
    size="small"
    sx={{ fontWeight: "bold" }}
  />
);

export default PropertyStatusBadge; 