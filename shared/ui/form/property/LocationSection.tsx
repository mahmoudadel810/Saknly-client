import { useState } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MapOutlined from "@mui/icons-material/MapOutlined";
import { CITY_OPTIONS } from "@/shared/constants/property";
import LoadingState from "@/shared/ui/LoadingState";
import { INITIAL_PROPERTY_FORM, LIMITS } from "@/shared/utils/propertyFormValidation";
import FormSection, { FieldRow } from "../FormSection";
import { bind, help, type SectionProps } from "./fields";

// Leaflet only runs in the browser and is heavy: load the picker when the dialog first opens.
const MapPicker = dynamic(() => import("@/shared/components/MapPicker"), {
  ssr: false,
  loading: () => <LoadingState label="جارٍ تحميل الخريطة…" compact />,
});

export default function LocationSection(p: SectionProps) {
  const [mapOpen, setMapOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { latitude, longitude } = p.values;
  const picked = latitude !== INITIAL_PROPERTY_FORM.latitude || longitude !== INITIAL_PROPERTY_FORM.longitude;

  return (
    <FormSection id="pf-location" step={3} title="الموقع" description="المدينة والحي، ومكان العقار على الخريطة.">
      <FieldRow>
        <TextField {...bind(p, "location")} select required label="المدينة" helperText={help(p, "location")}>
          {CITY_OPTIONS.map((city) => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...bind(p, "district")}
          label="الحي أو المنطقة"
          helperText={help(p, "district", "اختياري.")}
          slotProps={{ htmlInput: { maxLength: LIMITS.district } }}
        />
      </FieldRow>
      <TextField
        {...bind(p, "address")}
        label="العنوان"
        placeholder="الشارع أو أقرب علامة مميزة"
        helperText={help(p, "address", "اختياري، ويظهر في صفحة الإعلان.")}
        slotProps={{ htmlInput: { maxLength: LIMITS.address } }}
      />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          p: 2,
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
          bgcolor: "var(--c-surface-2)",
        }}
      >
        <div>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            المكان على الخريطة
          </Typography>
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {picked ? (
              <>
                حُدد المكان:{" "}
                <span dir="ltr" className="num">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </span>
              </>
            ) : (
              "اختياري، لكنه يساعد الباحثين على معرفة مكان العقار بدقة."
            )}
          </Typography>
        </div>
        <Button variant="outlined" startIcon={<MapOutlined />} onClick={() => setMapOpen(true)}>
          {picked ? "تعديل المكان" : "تحديد المكان على الخريطة"}
        </Button>
      </Box>

      <Dialog open={mapOpen} onClose={() => setMapOpen(false)} fullWidth maxWidth="md" fullScreen={fullScreen}>
        <DialogTitle sx={{ fontSize: "1.125rem", fontWeight: 600 }}>حدّد مكان العقار</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", minHeight: { sm: 560 } }}>
          {mapOpen && (
            <MapPicker
              latitude={latitude}
              longitude={longitude}
              onLocationSelect={(lat, lng) => {
                p.setField("latitude", lat);
                p.setField("longitude", lng);
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="contained" onClick={() => setMapOpen(false)}>
            تم
          </Button>
        </DialogActions>
      </Dialog>
    </FormSection>
  );
}
