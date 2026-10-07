import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { PROPERTY_TYPE_OPTIONS } from "@/shared/constants/property";
import { LIMITS, isShop } from "@/shared/utils/propertyFormValidation";
import FormSection, { FieldRow } from "../FormSection";
import { bind, help, type SectionProps } from "./fields";

const OPERATIONS = [
  { value: "sale", label: "للبيع" },
  { value: "rent", label: "للإيجار" },
  { value: "student", label: "سكن طلابي" },
];

export default function BasicsSection(p: SectionProps) {
  const student = p.values.operationType === "student";
  return (
    <FormSection id="pf-basics" step={1} title="الأساسيات" description="نوع الإعلان والعقار، وعنوان ووصف واضحان.">
      <FieldRow>
        <TextField
          {...bind(p, "operationType")}
          select
          required
          label="نوع الإعلان"
          helperText={help(p, "operationType")}
        >
          {OPERATIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...bind(p, "type")}
          select
          required
          label="نوع العقار"
          helperText={help(p, "type", student ? "السكن الطلابي للشقق والاستوديوهات وغيرها، عدا المحلات." : undefined)}
        >
          {PROPERTY_TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value} disabled={student && isShop(o.value)}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </FieldRow>
      <TextField
        {...bind(p, "title")}
        required
        label="عنوان الإعلان"
        placeholder="مثال: شقة 3 غرف قريبة من الجامعة"
        helperText={help(p, "title", `${p.values.title.length} / ${LIMITS.title}`)}
        slotProps={{ htmlInput: { maxLength: LIMITS.title } }}
      />
      <TextField
        {...bind(p, "description")}
        required
        multiline
        minRows={4}
        label="الوصف"
        placeholder="الحالة والتشطيب والمميزات وما يجاور العقار."
        helperText={help(p, "description", `${p.values.description.length} / ${LIMITS.description}`)}
        slotProps={{ htmlInput: { maxLength: LIMITS.description } }}
      />
    </FormSection>
  );
}
