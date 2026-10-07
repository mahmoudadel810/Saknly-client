"use client";

import React, { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import FormatQuoteRounded from "@mui/icons-material/FormatQuoteRounded";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { api, getErrorMessage } from "@/shared/services/api";
import { useToast } from "@/shared/provider/ToastProvider";

export interface Testimonial {
  _id: string;
  name: string;
  text: string;
  role?: string;
  createdAt?: string;
}

/** Which testimonials: the site-wide ones, or one agency's. */
export type TestimonialScope = { type: "general" } | { type: "agency"; agencyId: string };

const scopeParams = (scope: TestimonialScope) =>
  scope.type === "agency"
    ? { status: "approved", type: "agency", agencyId: scope.agencyId }
    : { status: "approved", type: "general" };

/** Approved testimonials only: the server returns pending ones to admins alone, and only when asked. */
export function useApprovedTestimonials(scope: TestimonialScope) {
  const key = scope.type === "agency" ? scope.agencyId : "general";
  return useQuery({
    queryKey: ["testimonials", scope.type, key],
    queryFn: async (): Promise<Testimonial[]> => {
      const res = await api.get("/testimonial", { params: scopeParams(scope) });
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });
}

const DATE = new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "long" });

export function TestimonialList({ items }: { items: Testimonial[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
      {items.map((item) => (
        <Box
          component="li"
          key={item._id}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            p: { xs: 2.5, md: 3 },
            border: 1,
            borderColor: "divider",
            borderRadius: "var(--r-card)",
            bgcolor: "background.paper",
            boxShadow: "var(--c-card-shadow)",
          }}
        >
          <FormatQuoteRounded aria-hidden sx={{ fontSize: 32, color: "var(--c-accent)", transform: "scaleX(-1)" }} />
          <Box component="blockquote" sx={{ m: 0, mt: -1 }}>
            <Typography variant="body1" sx={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
              {item.text}
            </Typography>
          </Box>
          <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 1.5, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Box
              aria-hidden
              sx={{
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "var(--c-primary-soft)",
                color: "primary.main",
                fontWeight: 700,
              }}
            >
              {item.name.trim().charAt(0)}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" component="p" sx={{ fontSize: "0.9375rem", fontWeight: 700 }}>
                {item.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="p">
                {[item.role, item.createdAt ? DATE.format(new Date(item.createdAt)) : null].filter(Boolean).join("، ")}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
    </ul>
  );
}

const NAME_MAX = 50;
const TEXT_MAX = 500;

interface FormErrors {
  name?: string;
  text?: string;
}

const validate = (name: string, text: string): FormErrors => {
  const errors: FormErrors = {};
  const n = name.trim();
  const t = text.trim();
  if (!n) errors.name = "اكتب اسمك.";
  else if (n.length < 2) errors.name = "الاسم قصير جدًا.";
  if (!t) errors.text = "اكتب رأيك.";
  else if (t.length < 5) errors.text = "الرأي قصير جدًا.";
  return errors;
};

export interface TestimonialDialogProps {
  open: boolean;
  onClose: () => void;
  scope: TestimonialScope;
  /** What the opinion is about, for the title: "عن سكنلي" or "عن شركة …". */
  subject: string;
}

/**
 * The "write your opinion" form. New testimonials are saved as pending, so the success message says it will
 * appear after review instead of claiming it was published (AUDIT F-14).
 */
export function TestimonialDialog({ open, onClose, scope, subject }: TestimonialDialogProps) {
  const id = useId();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setText("");
    setErrors({});
    setSubmitError(null);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(name, text);
    setErrors(found);
    if (found.name || found.text || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post("/testimonial", {
        name: name.trim(),
        text: text.trim(),
        type: scope.type,
        ...(scope.type === "agency" ? { agencyId: scope.agencyId } : {}),
      });
      showToast("أُرسل رأيك، وسيظهر بعد مراجعته.", "success");
      reset();
      onClose();
    } catch (err) {
      setSubmitError(getErrorMessage(err, "تعذر إرسال رأيك. حاول مرة أخرى."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" aria-labelledby={`${id}-title`}>
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle id={`${id}-title`}>اكتب رأيك {subject}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            يظهر رأيك للزوار بعد أن يراجعه فريق سكنلي.
          </Typography>
          {submitError && (
            <Alert severity="error" role="alert">
              {submitError}
            </Alert>
          )}
          <TextField
            label="الاسم"
            required
            fullWidth
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name ?? "يظهر مع رأيك."}
            slotProps={{ htmlInput: { maxLength: NAME_MAX, autoComplete: "name" } }}
          />
          <TextField
            label="رأيك"
            required
            fullWidth
            multiline
            minRows={4}
            value={text}
            onChange={(event) => setText(event.target.value)}
            error={Boolean(errors.text)}
            helperText={errors.text ?? `${text.length} / ${TEXT_MAX}`}
            slotProps={{ htmlInput: { maxLength: TEXT_MAX } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={close} disabled={submitting} color="secondary">
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {submitting ? "جاري الإرسال…" : "إرسال الرأي"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
