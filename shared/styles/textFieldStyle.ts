// src/shared/styles/textFieldStyles.ts

const PRIMARY = "var(--primary-600)";

export const textFieldStyles = {
  "& .MuiInputBase-input": {
    color: "#707070",
    "&::-webkit-password-reveal-button": {
      display: "none",
    },
    "&::-ms-reveal": {
      display: "none",
    },
    padding: "12px 16px",
    borderRadius: "8px",
    height: "auto",
    caretColor: PRIMARY,
    "&:focus": {
      outline: "none",
      boxShadow: "none",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#707070",
    borderRadius: "8px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#707070",
  },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: PRIMARY,
      borderWidth: "2px",
    },
    "&.Mui-focused .MuiInputBase-input": {
      color: PRIMARY,
    },
    "&.Mui-focused": {
      outline: "none",
      boxShadow: "none",
      border: "none",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#707070",
    transformOrigin: "top left !important",
    left: "1.25rem !important",
    right: "unset !important",
  },
  // Dark mode: label color white
  ".dark & .MuiInputLabel-root": {
    color: "#fff",
  },
  ".dark & .Mui-focused .MuiInputLabel-root, .dark & .MuiInputLabel-root.Mui-focused": {
    color: "#fff",
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(2px, -9px) scale(0.75) translateX(-10px)",
  },
};
