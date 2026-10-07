"use client";

import React, { useEffect, useId, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateOutlined from "@mui/icons-material/AddPhotoAlternateOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import { api } from "@/shared/services/api";
import { visuallyHidden } from "../a11y";
import { adminErrorMessage } from "./errors";
import type { AdminAgency } from "./queries";

// server/modules/Agency/agencyValidation.js and server/utils/multer.js
const NAME_MAX = 70;
const DESCRIPTION_MAX = 512;
const LOGO_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
const LOGO_MAX_BYTES = 4 * 1024 * 1024;

export interface AgencyFormDialogProps {
  open: boolean;
  /** Edit this agency; omit to create one. */
  agency?: AdminAgency | null;
  onClose: () => void;
  onSaved: (agency: AdminAgency | null, created: boolean) => void;
}

/** Create or edit an agency: name, description, featured flag and logo (required when creating). */
export default function AgencyFormDialog({ open, agency, onClose, onSaved }: AgencyFormDialogProps) {
  const editing = Boolean(agency);
  const id = useId();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Reset the form each time it opens.
  useEffect(() => {
    if (!open) return;
    setName(agency?.name ?? "");
    setDescription(agency?.description ?? "");
    setFeatured(agency?.isFeatured ?? false);
    setLogo(null);
    setPreview(null);
    setLogoError("");
    setSubmitted(false);
    setFormError("");
  }, [open, agency]);

  // Object URLs are released when replaced or when the dialog closes.
  useEffect(() => {
    if (!logo) return;
    const url = URL.createObjectURL(logo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  const nameError = submitted && !name.trim() ? "اكتب اسم الوكالة." : "";
  const logoMissing = !editing && !logo;
  const logoMessage = logoError || (submitted && logoMissing ? "اختر شعارًا للوكالة." : "");

  const pickLogo = (file: File | undefined) => {
    setLogoError("");
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      setLogoError("الصيغ المقبولة: JPG أو PNG أو GIF أو WEBP أو AVIF.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setLogoError("حجم الشعار أكبر من 4 ميجابايت.");
      return;
    }
    setLogo(file);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setFormError("");
    if (!name.trim() || logoMissing || logoError || saving) return;

    const form = new FormData();
    form.append("name", name.trim());
    form.append("description", description.trim());
    form.append("isFeatured", String(featured));
    if (logo) form.append("logo", logo);

    setSaving(true);
    try {
      const { data } = editing
        ? await api.put(`/agencies/${agency!._id}`, form)
        : await api.post("/agencies", form);
      onSaved((data?.data as AdminAgency | undefined) ?? null, !editing);
    } catch (err) {
      setFormError(adminErrorMessage(err, editing ? "تعذّر حفظ التعديلات. حاول مرة أخرى." : "تعذّرت إضافة الوكالة. حاول مرة أخرى."));
    } finally {
      setSaving(false);
    }
  };

  const shownLogo = preview ?? agency?.logo?.url ?? null;

  return (
    <Dialog
      open={open}
      onClose={() => !saving && onClose()}
      maxWidth="sm"
      fullWidth
      aria-labelledby={`${id}-title`}
      slotProps={{ paper: { component: "form", onSubmit: submit, noValidate: true } as object }}
    >
      <DialogTitle id={`${id}-title`} sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
        {editing ? "تعديل الوكالة" : "إضافة وكالة"}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, "&&": { pt: 1 } }}>
        {formError && (
          <Alert severity="error" role="alert">
            {formError}
          </Alert>
        )}

        <TextField
          label="اسم الوكالة"
          required
          fullWidth
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={Boolean(nameError)}
          helperText={nameError || `${name.length} من ${NAME_MAX} حرفًا`}
          slotProps={{ htmlInput: { maxLength: NAME_MAX } }}
        />

        <TextField
          label="الوصف"
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          helperText={`اختياري. ${description.length} من ${DESCRIPTION_MAX} حرفًا`}
          slotProps={{ htmlInput: { maxLength: DESCRIPTION_MAX } }}
        />

        <Box>
          <Typography component="p" variant="subtitle2" id={`${id}-logo-label`} sx={{ mb: 1 }}>
            الشعار{!editing && <span aria-hidden> *</span>}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Avatar
              src={shownLogo ?? undefined}
              alt={shownLogo ? "معاينة الشعار" : ""}
              variant="rounded"
              sx={{ width: 64, height: 64, borderRadius: "10px", bgcolor: "var(--c-bg)", color: "var(--c-muted)", border: 1, borderColor: "divider" }}
            >
              <BusinessOutlined />
            </Avatar>
            <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateOutlined />} disabled={saving}>
              {shownLogo ? "تغيير الشعار" : "اختيار شعار"}
              <Box
                component="input"
                type="file"
                accept={LOGO_TYPES.join(",")}
                aria-labelledby={`${id}-logo-label`}
                aria-required={!editing}
                aria-invalid={Boolean(logoMessage) || undefined}
                aria-describedby={`${id}-logo-help`}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  pickLogo(event.target.files?.[0]);
                  event.target.value = "";
                }}
                sx={visuallyHidden}
              />
            </Button>
            {logo && (
              <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                {logo.name}
              </Typography>
            )}
          </Box>
          <FormHelperText id={`${id}-logo-help`} error={Boolean(logoMessage)}>
            {logoMessage ||
              (editing ? "اترك الشعار كما هو أو اختر صورة جديدة. يُحذف الشعار القديم بعد الحفظ." : "صورة حتى 4 ميجابايت.")}
          </FormHelperText>
        </Box>

        <FormControlLabel
          control={<Switch checked={featured} onChange={(event) => setFeatured(event.target.checked)} />}
          label="وكالة مميزة (تظهر في الصفحة الرئيسية)"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">
          إلغاء
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
        >
          {saving ? "جارٍ الحفظ…" : editing ? "حفظ التعديلات" : "إضافة الوكالة"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
