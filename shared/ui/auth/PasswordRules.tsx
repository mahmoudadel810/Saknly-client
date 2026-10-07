import Box from "@mui/material/Box";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUncheckedOutlined";
import { visuallyHidden } from "@/shared/ui/a11y";

// The server's rules (server/modules/Auth/authValidation.js), mirrored in shared/utils/authValidation.ts.
const RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "من 5 إلى 30 حرفًا", test: (v) => v.length >= 5 && v.length <= 30 },
  { label: "حرف إنجليزي كبير واحد على الأقل (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { label: "رقم واحد على الأقل", test: (v) => /\d/.test(v) },
  { label: "رمز واحد على الأقل، مثل ! أو @ أو #", test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

export const passwordMeetsRules = (value: string) => RULES.every((rule) => rule.test(value));

/**
 * The password rules, shown before the user types and ticked as each one is met. Render it as the password
 * field's helper text (formHelperText component "div") so the field is described by it.
 */
export default function PasswordRules({ value, id }: { value: string; id: string }) {
  return (
    <Box component="ul" id={id} sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 0.5 }}>
      {RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <Box
            component="li"
            key={rule.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              fontSize: "0.8125rem",
              color: met ? "success.main" : "text.secondary",
              transition: "color 150ms ease-out",
            }}
          >
            {met ? (
              <CheckCircleOutlined aria-hidden sx={{ fontSize: 16 }} />
            ) : (
              <RadioButtonUncheckedOutlined aria-hidden sx={{ fontSize: 16 }} />
            )}
            {rule.label}
            <Box component="span" sx={visuallyHidden}>
              {met ? "(متحقق)" : "(غير متحقق)"}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
