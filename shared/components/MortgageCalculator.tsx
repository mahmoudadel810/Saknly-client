"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { formatNumber } from "@/shared/ui/Price";

interface MortgageCalculatorProps {
  price: number;
  /** The listing's down payment, when the owner gave one. */
  downPayment?: number;
  /** The listing's installment period in years, when the owner gave one. */
  termInYears?: number;
}

/** The monthly payment of an amortised loan; with a 0% rate it is the remainder split evenly. */
export function monthlyPayment(principal: number, annualRatePercent: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const months = years * 12;
  if (annualRatePercent <= 0) return principal / months;
  const r = annualRatePercent / 100 / 12;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

const toNumber = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/**
 * An installment estimate for a sale listing. It starts from the listing's own down payment and period and
 * a 0% rate (developer installments in Egypt are usually interest-free); the visitor can change all three.
 * The result is labelled an estimate: the owner's terms decide.
 */
export default function MortgageCalculator({ price, downPayment, termInYears }: MortgageCalculatorProps) {
  const [down, setDown] = useState(downPayment ? String(downPayment) : "");
  const [years, setYears] = useState(termInYears ? String(termInYears) : "");
  const [rate, setRate] = useState("0");

  const principal = Math.max(0, price - toNumber(down));
  const monthly = monthlyPayment(principal, toNumber(rate), toNumber(years));

  return (
    <Box>
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField
          label="المقدم (ج.م)"
          type="number"
          value={down}
          onChange={(event) => setDown(event.target.value)}
          slotProps={{ htmlInput: { min: 0, max: price, inputMode: "numeric" } }}
        />
        <TextField
          label="المدة (سنوات)"
          type="number"
          value={years}
          onChange={(event) => setYears(event.target.value)}
          slotProps={{ htmlInput: { min: 1, max: 30, inputMode: "numeric" } }}
        />
        <TextField
          label="الفائدة السنوية (%)"
          type="number"
          value={rate}
          onChange={(event) => setRate(event.target.value)}
          slotProps={{ htmlInput: { min: 0, max: 50, step: 0.5, inputMode: "decimal" } }}
        />
      </div>
      <Box sx={{ mt: 2, p: 2, borderRadius: "6px", bgcolor: "var(--c-primary-soft)" }} aria-live="polite">
        {monthly > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary">
              القسط الشهري التقريبي
            </Typography>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {formatNumber(Math.round(monthly))} ج.م / شهر
            </Typography>
            <Typography variant="caption" color="text.secondary">
              على مبلغ {formatNumber(principal)} ج.م. تقدير فقط؛ الشروط الفعلية يحددها المالك.
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            أدخل المقدم ومدة التقسيط لترى القسط الشهري التقريبي.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
