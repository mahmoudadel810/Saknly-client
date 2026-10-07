import Box from "@mui/material/Box";
import LoadingState from "@/shared/ui/LoadingState";

/** The route-level loading state while a page's code loads; pages show their own skeletons for data. */
export default function Loading() {
  return (
    <Box component="main" id="main" sx={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
      <LoadingState label="جارٍ تحميل الصفحة…" />
    </Box>
  );
}
