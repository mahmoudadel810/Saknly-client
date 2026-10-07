import { useRef } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateOutlined from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import { UPLOAD_LIMITS } from "@/shared/utils/fileCompression";
import FormSection from "../FormSection";
import { fieldId } from "./fields";

export interface PhotosSectionProps {
  previews: string[];
  error?: string;
  processing: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export default function PhotosSection({ previews, error, processing, onAdd, onRemove }: PhotosSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const full = previews.length >= UPLOAD_LIMITS.maxFiles;
  const hintId = `${fieldId("images")}-hint`;

  return (
    <FormSection id="pf-photos" step={5} title="الصور" description="الصورة الأولى هي التي تظهر في نتائج البحث.">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={UPLOAD_LIMITS.accept}
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          // Reset, so choosing a file that was just removed fires a change again.
          e.target.value = "";
          if (files.length) onAdd(files);
        }}
      />
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))" },
        }}
      >
        {previews.map((url, index) => (
          <Box
            key={url}
            sx={{
              position: "relative",
              aspectRatio: "4 / 3",
              borderRadius: "6px",
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
              bgcolor: "var(--c-surface-2)",
            }}
          >
            <Image src={url} alt={`صورة ${index + 1}`} fill unoptimized sizes="200px" style={{ objectFit: "cover" }} />
            {index === 0 && (
              <Box
                component="span"
                sx={{
                  position: "absolute",
                  insetInlineStart: 6,
                  bottom: 6,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: "6px",
                  bgcolor: "var(--c-surface)",
                  border: 1,
                  borderColor: "divider",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                الرئيسية
              </Box>
            )}
            <IconButton
              size="small"
              onClick={() => onRemove(index)}
              aria-label={`حذف الصورة ${index + 1}`}
              sx={{
                position: "absolute",
                top: 6,
                insetInlineEnd: 6,
                bgcolor: "var(--c-surface)",
                border: 1,
                borderColor: "divider",
                "&:hover": { bgcolor: "var(--c-surface-raised)" },
              }}
            >
              <CloseOutlined fontSize="small" />
            </IconButton>
          </Box>
        ))}

        {!full && (
          <Button
            id={fieldId("images")}
            onClick={() => inputRef.current?.click()}
            disabled={processing}
            variant="outlined"
            color={error ? "error" : "primary"}
            aria-describedby={hintId}
            sx={{
              aspectRatio: "4 / 3",
              height: "auto",
              flexDirection: "column",
              gap: 0.5,
              borderStyle: "dashed",
              borderRadius: "6px",
            }}
          >
            {processing ? <CircularProgress size={24} aria-hidden /> : <AddPhotoAlternateOutlined />}
            <span>{processing ? "جارٍ تجهيز الصور…" : previews.length ? "إضافة صور" : "اختر الصور"}</span>
          </Button>
        )}
      </Box>

      <div id={hintId}>
        {error && (
          <FormHelperText error sx={{ mt: 0 }} role="alert">
            {error}
          </FormHelperText>
        )}
        <Typography variant="body2" color="text.secondary">
          <span className="num">{previews.length}</span> من {UPLOAD_LIMITS.maxFiles} صور. الصيغ: JPG أو PNG أو WebP أو
          AVIF أو GIF. نصغّر الصور تلقائيًا قبل الرفع، ويجب ألا يزيد حجمها معًا بعد التصغير عن 4 ميجابايت.
        </Typography>
      </div>
    </FormSection>
  );
}
