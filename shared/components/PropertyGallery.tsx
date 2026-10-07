"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import HomeWorkOutlined from "@mui/icons-material/HomeWorkOutlined";
import ZoomOutMapOutlined from "@mui/icons-material/ZoomOutMapOutlined";
import { canOptimize } from "@/shared/ui/PropertyCard";

export interface GalleryImage {
  url: string;
  isMain?: boolean;
}

/** The main image first, then the rest in upload order. */
const ordered = (images: GalleryImage[]) => {
  const valid = images.filter((img) => Boolean(img?.url));
  const main = valid.findIndex((img) => img.isMain);
  if (main <= 0) return valid;
  return [valid[main], ...valid.slice(0, main), ...valid.slice(main + 1)];
};

function Photo({ src, alt, sizes, priority }: { src: string; alt: string; sizes: string; priority?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      style={{ objectFit: "cover" }}
      unoptimized={!canOptimize(src)}
    />
  );
}

/**
 * The listing photos: a large first image (a button that opens the full-screen viewer), the image count and
 * a row of thumbnails. The viewer has previous/next buttons and arrow-key navigation.
 */
export default function PropertyGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const photos = ordered(images);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = photos.length;

  // In RTL "next" is to the left: the arrow keys follow the reading direction.
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") next();
      if (event.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  if (count === 0) {
    return (
      <Box
        sx={{
          aspectRatio: "16 / 10",
          borderRadius: "10px",
          border: 1,
          borderColor: "divider",
          bgcolor: "var(--c-bg)",
          display: "grid",
          placeItems: "center",
          color: "var(--c-muted)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <HomeWorkOutlined aria-hidden sx={{ fontSize: 48 }} />
          <Typography variant="body2" color="text.secondary">
            لم يضف المالك صورًا لهذا الإعلان
          </Typography>
        </Box>
      </Box>
    );
  }

  const current = photos[index];

  return (
    <Box component="section" aria-label="صور العقار">
      <ButtonBase
        onClick={() => setOpen(true)}
        aria-label={`عرض الصور بحجم كامل، الصورة ${index + 1} من ${count}`}
        sx={{
          position: "relative",
          display: "block",
          width: "100%",
          aspectRatio: { xs: "4 / 3", sm: "16 / 10" },
          borderRadius: "10px",
          overflow: "hidden",
          bgcolor: "var(--c-bg)",
          "&.Mui-focusVisible": { outline: "2px solid var(--c-primary)", outlineOffset: 2 },
        }}
      >
        <Photo src={current.url} alt={`${title}، الصورة ${index + 1}`} sizes="(min-width: 1024px) 760px, 100vw" priority={index === 0} />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            bottom: 12,
            insetInlineEnd: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            height: 28,
            borderRadius: "6px",
            bgcolor: "var(--c-surface)",
            color: "text.primary",
            fontSize: "0.8125rem",
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <ZoomOutMapOutlined sx={{ fontSize: 16 }} />
          {index + 1} / {count}
        </Box>
      </ButtonBase>

      {count > 1 && (
        <Box
          component="ul"
          aria-label="الصور المصغرة"
          sx={{
            display: "flex",
            gap: 1,
            m: 0,
            mt: 1,
            p: 0,
            listStyle: "none",
            overflowX: "auto",
            scrollbarWidth: "thin",
          }}
        >
          {photos.map((photo, i) => (
            <li key={`${photo.url}-${i}`}>
              <ButtonBase
                onClick={() => setIndex(i)}
                aria-label={`الصورة ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                sx={{
                  position: "relative",
                  width: 88,
                  height: 66,
                  borderRadius: "6px",
                  overflow: "hidden",
                  flexShrink: 0,
                  outline: i === index ? "2px solid var(--c-primary)" : "1px solid var(--c-border)",
                  outlineOffset: i === index ? 1 : -1,
                  opacity: i === index ? 1 : 0.8,
                  "&:hover": { opacity: 1 },
                  "&.Mui-focusVisible": { outline: "2px solid var(--c-primary)", outlineOffset: 1 },
                }}
              >
                <Photo src={photo.url} alt="" sizes="88px" />
              </ButtonBase>
            </li>
          ))}
        </Box>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen
        slotProps={{ paper: { "aria-label": `صور ${title}`, sx: { bgcolor: "var(--c-bg)", borderRadius: 0 } } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, height: 56 }}>
          <Typography component="p" variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }} aria-live="polite">
            الصورة {index + 1} من {count}
          </Typography>
          <IconButton onClick={() => setOpen(false)} aria-label="إغلاق عارض الصور">
            <CloseOutlined />
          </IconButton>
        </Box>
        <Box sx={{ position: "relative", flex: 1, mx: { xs: 0, md: 9 }, mb: 2 }}>
          <Image
            src={current.url}
            alt={`${title}، الصورة ${index + 1}`}
            fill
            sizes="100vw"
            style={{ objectFit: "contain" }}
            unoptimized={!canOptimize(current.url)}
          />
          {count > 1 && (
            <>
              <IconButton
                onClick={prev}
                aria-label="الصورة السابقة"
                sx={{ position: "absolute", top: "50%", insetInlineStart: 8, transform: "translateY(-50%)", bgcolor: "var(--c-surface)", border: 1, borderColor: "divider", "&:hover": { bgcolor: "var(--c-surface)" } }}
              >
                <ChevronRightOutlined />
              </IconButton>
              <IconButton
                onClick={next}
                aria-label="الصورة التالية"
                sx={{ position: "absolute", top: "50%", insetInlineEnd: 8, transform: "translateY(-50%)", bgcolor: "var(--c-surface)", border: 1, borderColor: "divider", "&:hover": { bgcolor: "var(--c-surface)" } }}
              >
                <ChevronLeftOutlined />
              </IconButton>
            </>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
