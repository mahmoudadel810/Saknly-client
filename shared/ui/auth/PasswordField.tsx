"use client";

import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";

/**
 * A password input with a show/hide toggle inside the box at the inline end. The theme keeps the toggle inside
 * the outline (no negative edge margin); never zero the input's padding here.
 */
export default function PasswordField(props: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      fullWidth
      slotProps={{
        ...props.slotProps,
        htmlInput: { dir: "ltr", ...(props.slotProps?.htmlInput as object) },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVisible((v) => !v)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                aria-pressed={visible}
              >
                {visible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
