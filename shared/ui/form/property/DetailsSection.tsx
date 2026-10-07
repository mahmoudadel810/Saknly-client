import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import { AMENITIES } from "@/shared/constants/property";
import { getCurrentAreaConstraints, isShop, toDecimal } from "@/shared/utils/propertyFormValidation";
import FormSection, { FieldRow } from "../FormSection";
import { bind, help, numericInput, range, type SectionProps } from "./fields";

const ROOM_TYPES = [
  { value: "private", label: "غرفة خاصة" },
  { value: "shared", label: "غرفة مشتركة" },
  { value: "dormitory", label: "سكن جماعي" },
];
const GENDER_POLICIES = [
  { value: "male", label: "طلاب" },
  { value: "female", label: "طالبات" },
  { value: "mixed", label: "الجميع" },
];
const SEMESTERS = [
  { value: "fall", label: "الفصل الأول" },
  { value: "spring", label: "الفصل الثاني" },
  { value: "summer", label: "الفصل الصيفي" },
  { value: "academic-year", label: "العام الدراسي" },
  { value: "full-year", label: "سنة كاملة" },
];

export default function DetailsSection(p: SectionProps) {
  const { type, operationType, amenities, nearbyUniversities } = p.values;
  const shop = isShop(type);
  const { min, max } = getCurrentAreaConstraints(type);

  const setUniversity = (index: number, field: "name" | "distanceInKm", value: string) =>
    p.setField(
      "nearbyUniversities",
      nearbyUniversities.map((u, i) => (i === index ? { ...u, [field]: value } : u)),
    );

  return (
    <FormSection id="pf-details" step={4} title="تفاصيل العقار" description="المساحة والغرف والمرافق.">
      <FieldRow columns={3}>
        <TextField
          {...bind(p, "area", { digits: true })}
          required
          label="المساحة (م²)"
          helperText={help(p, "area", type ? `بين ${min} و${max} م² لهذا النوع.` : "اختر نوع العقار أولًا.")}
          slotProps={numericInput}
        />
        <TextField
          {...bind(p, "bedrooms")}
          select
          required={!shop}
          disabled={shop}
          label="غرف النوم"
          helperText={help(p, "bedrooms", shop ? "المحلات بدون غرف نوم." : undefined)}
        >
          {range(0, 10).map((n) => (
            <MenuItem key={n} value={String(n)}>
              {n === 0 ? "بدون" : n}
            </MenuItem>
          ))}
        </TextField>
        <TextField {...bind(p, "bathrooms")} select required label="الحمامات" helperText={help(p, "bathrooms")}>
          {range(1, 10).map((n) => (
            <MenuItem key={n} value={String(n)}>
              {n}
            </MenuItem>
          ))}
        </TextField>
      </FieldRow>
      <FieldRow>
        <TextField {...bind(p, "floor")} select label="الدور" helperText={help(p, "floor", "اختياري.")}>
          {range(0, 30).map((n) => (
            <MenuItem key={n} value={String(n)}>
              {n === 0 ? "الأرضي" : n}
            </MenuItem>
          ))}
        </TextField>
        <TextField {...bind(p, "totalFloors")} select label="عدد أدوار المبنى" helperText="اختياري.">
          {range(1, 30).map((n) => (
            <MenuItem key={n} value={String(n)}>
              {n}
            </MenuItem>
          ))}
        </TextField>
      </FieldRow>
      <TextField
        id="pf-amenities"
        select
        fullWidth
        label="المرافق"
        value={amenities}
        onChange={(e) => {
          const value = e.target.value as unknown as string[] | string;
          p.setField("amenities", typeof value === "string" ? value.split(",") : value);
        }}
        helperText="اختياري. اختر كل ما ينطبق."
        slotProps={{
          select: {
            multiple: true,
            renderValue: (selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            ),
          },
        }}
      >
        {AMENITIES.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </TextField>

      {operationType === "student" && (
        <Box
          component="fieldset"
          sx={{
            m: 0,
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: "var(--r-inner)",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Typography component="legend" variant="h6" sx={{ px: 0.5 }}>
            تفاصيل السكن الطلابي
          </Typography>
          <FieldRow columns={3}>
            <TextField
              {...bind(p, "studentRoomType")}
              select
              required
              label="نوع الغرفة"
              helperText={help(p, "studentRoomType")}
            >
              {ROOM_TYPES.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              {...bind(p, "studentsPerRoom")}
              select
              required
              label="عدد الطلاب في الغرفة"
              helperText={help(p, "studentsPerRoom")}
            >
              {range(1, 4).map((n) => (
                <MenuItem key={n} value={String(n)}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              {...bind(p, "studentGenderPolicy")}
              select
              required
              label="السكن متاح لـ"
              helperText={help(p, "studentGenderPolicy")}
            >
              {GENDER_POLICIES.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </FieldRow>
          <FieldRow>
            <TextField {...bind(p, "semester")} select label="مدة السكن" helperText="اختياري.">
              {SEMESTERS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Checkbox
                  checked={p.values.academicYearOnly}
                  onChange={(e) => p.setField("academicYearOnly", e.target.checked)}
                />
              }
              label="خلال العام الدراسي فقط"
              sx={{ mt: { md: 3.5 } }}
            />
          </FieldRow>

          <div>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              الجامعات القريبة (اختياري)
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {nearbyUniversities.map((u, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                  <TextField
                    label={`الجامعة ${index + 1}`}
                    value={u.name}
                    onChange={(e) => setUniversity(index, "name", e.target.value)}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    label="المسافة (كم)"
                    value={u.distanceInKm}
                    onChange={(e) => setUniversity(index, "distanceInKm", toDecimal(e.target.value))}
                    slotProps={{ htmlInput: { inputMode: "decimal", dir: "ltr" } }}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    aria-label={`حذف الجامعة ${index + 1}`}
                    onClick={() =>
                      p.setField(
                        "nearbyUniversities",
                        nearbyUniversities.filter((_, i) => i !== index),
                      )
                    }
                    disabled={nearbyUniversities.length === 1}
                    sx={{ mb: 0.5 }}
                  >
                    <DeleteOutlineOutlined />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Button
              startIcon={<AddOutlined />}
              onClick={() => p.setField("nearbyUniversities", [...nearbyUniversities, { name: "", distanceInKm: "" }])}
              sx={{ mt: 1 }}
            >
              إضافة جامعة
            </Button>
          </div>
        </Box>
      )}
    </FormSection>
  );
}
