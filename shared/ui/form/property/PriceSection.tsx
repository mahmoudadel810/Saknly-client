import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { formatPrice } from "@/shared/ui/Price";
import { LIMITS } from "@/shared/utils/propertyFormValidation";
import FormSection, { FieldRow } from "../FormSection";
import { bind, help, numericInput, range, type SectionProps } from "./fields";

const MONEY_HINT = "بالجنيه المصري، أرقام فقط.";

export default function PriceSection(p: SectionProps) {
  const { operationType, price, paymentMethod } = p.values;
  const sale = operationType === "sale";
  const rental = operationType === "rent" || operationType === "student";
  const pricePreview = price ? formatPrice(Number(price), rental ? "rent" : undefined) : undefined;

  return (
    <FormSection
      id="pf-price"
      step={2}
      title="السعر والشروط"
      description={rental ? "الإيجار الشهري وشروط التعاقد." : sale ? "سعر البيع وطريقة الدفع والتسليم." : undefined}
    >
      <FieldRow>
        <TextField
          {...bind(p, "price", { digits: true })}
          required
          label={rental ? "الإيجار الشهري" : "السعر"}
          helperText={help(p, "price", pricePreview ?? `${MONEY_HINT} الحد الأقصى 100 مليون جنيه.`)}
          slotProps={numericInput}
        />
        <FormControlLabel
          control={
            <Checkbox checked={p.values.isNegotiable} onChange={(e) => p.setField("isNegotiable", e.target.checked)} />
          }
          label="السعر قابل للتفاوض"
          sx={{ mt: { md: 3.5 } }}
        />
      </FieldRow>

      {!operationType && (
        <Typography variant="body2" color="text.secondary">
          اختر نوع الإعلان في الأساسيات لتظهر شروط البيع أو الإيجار.
        </Typography>
      )}

      {sale && (
        <>
          <FieldRow columns={3}>
            <TextField {...bind(p, "ownershipType")} select label="نوع الملكية">
              <MenuItem value="firstOwner">مالك أول</MenuItem>
              <MenuItem value="resale">إعادة بيع</MenuItem>
            </TextField>
            <TextField {...bind(p, "propertyStatus")} select label="حالة العقار">
              <MenuItem value="ready">جاهز للسكن</MenuItem>
              <MenuItem value="underConstruction">تحت الإنشاء</MenuItem>
            </TextField>
            <TextField {...bind(p, "paymentMethod")} select label="طريقة الدفع">
              <MenuItem value="cash">كاش</MenuItem>
              <MenuItem value="installment">تقسيط</MenuItem>
              <MenuItem value="cashOrInstallment">كاش أو تقسيط</MenuItem>
            </TextField>
          </FieldRow>
          {paymentMethod !== "cash" && (
            <FieldRow columns={3}>
              <TextField
                {...bind(p, "downPayment", { digits: true })}
                required
                label="المقدم"
                helperText={help(p, "downPayment", MONEY_HINT)}
                slotProps={numericInput}
              />
              <TextField
                {...bind(p, "installmentPeriodInYears")}
                select
                required
                label="مدة التقسيط"
                helperText={help(p, "installmentPeriodInYears")}
              >
                {range(1, 30).map((n) => (
                  <MenuItem key={n} value={String(n)}>
                    {n === 1 ? "سنة واحدة" : n === 2 ? "سنتان" : `${n} ${n <= 10 ? "سنوات" : "سنة"}`}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                {...bind(p, "minInstallmentAmount", { digits: true })}
                label="أقل قسط شهري"
                helperText={help(p, "minInstallmentAmount", "اختياري.")}
                slotProps={numericInput}
              />
            </FieldRow>
          )}
          <FieldRow>
            <TextField {...bind(p, "deliveryDate")} type="date" label="موعد التسليم" helperText="اختياري." />
            <TextField
              {...bind(p, "deliveryTerms")}
              multiline
              minRows={2}
              label="شروط التسليم"
              helperText={help(p, "deliveryTerms", `اختياري. ${p.values.deliveryTerms.length} / ${LIMITS.terms}`)}
              slotProps={{ htmlInput: { maxLength: LIMITS.terms } }}
            />
          </FieldRow>
        </>
      )}

      {rental && (
        <>
          <FieldRow columns={3}>
            <TextField
              {...bind(p, "deposit", { digits: true })}
              label="التأمين"
              helperText={help(p, "deposit", "اختياري. " + MONEY_HINT)}
              slotProps={numericInput}
            />
            <TextField
              {...bind(p, "leaseDuration")}
              select
              required
              label="مدة العقد"
              helperText={help(p, "leaseDuration")}
            >
              {[1, 2, 3, 4, 5, 6, 9, 12, 18, 24, 36, 48, 60, 120].map((n) => (
                <MenuItem key={n} value={String(n)}>
                  {n === 1 ? "شهر واحد" : n === 2 ? "شهران" : n <= 10 ? `${n} أشهر` : `${n} شهرًا`}
                </MenuItem>
              ))}
            </TextField>
            <TextField {...bind(p, "availableFrom")} type="date" label="متاح من" helperText="اختياري." />
          </FieldRow>
          <TextField
            {...bind(p, "rulesOther")}
            multiline
            minRows={2}
            label="شروط أخرى"
            placeholder="مثال: للعائلات فقط، ممنوع التدخين."
            helperText={help(p, "rulesOther", `اختياري. ${p.values.rulesOther.length} / ${LIMITS.terms}`)}
            slotProps={{ htmlInput: { maxLength: LIMITS.terms } }}
          />
        </>
      )}
    </FormSection>
  );
}
