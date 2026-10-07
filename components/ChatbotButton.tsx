"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import { api } from "@/shared/services/api";
import { visuallyHidden } from "@/shared/ui/a11y";
import { arabicErrorMessage } from "@/shared/ui/form/errorMessage";

// server/modules/chatBot/chat.routes.js rejects questions longer than 500 characters.
const MAX_QUESTION = 500;

const SUGGESTIONS = ["شقق للإيجار في شبين الكوم", "شقق للبيع في القاهرة الجديدة", "سكن طلابي قريب من الجامعة", "عقارات للبيع أقل من مليون جنيه"];

type Message = { id: number; role: "user" | "bot"; text: string };

/** Pages where the floating button would cover the page's own job. */
const HIDDEN_ON = ["/chatBot", "/login", "/register", "/resetPassword", "/newPassword", "/confirm-email"];

/**
 * The chat thread and composer, used by the floating button's dialog and by /chatBot. One question at a time;
 * a failed question can be sent again. Only Arabic server messages are shown.
 */
export function ChatConversation({
  onClose,
  autoFocus = false,
  showHeader = true,
}: {
  onClose?: () => void;
  autoFocus?: boolean;
  /** The /chatBot page has its own PageHeader. */
  showHeader?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<{ question: string; message: string } | null>(null);
  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading, failed]);

  const ask = async (raw: string, { retry = false } = {}) => {
    const question = raw.trim();
    if (!question || loading) return;
    setFailed(null);
    if (!retry) {
      setMessages((prev) => [...prev, { id: nextId.current++, role: "user", text: question }]);
      setInput("");
    }
    setLoading(true);
    try {
      const res = await api.post("/chat", { question });
      const answer = typeof res.data?.answer === "string" ? res.data.answer.trim() : "";
      if (!answer) throw new Error("empty answer");
      setMessages((prev) => [...prev, { id: nextId.current++, role: "bot", text: answer }]);
    } catch (err) {
      setFailed({ question, message: arabicErrorMessage(err, "المساعد غير متاح الآن. حاول مرة أخرى بعد قليل.") });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {showHeader && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box aria-hidden sx={{ color: "primary.main", display: "flex" }}>
            <SmartToyOutlined />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography id={titleId} component="h2" variant="h6">
              مساعد سكنلي
            </Typography>
            <Typography variant="caption" color="text.secondary" component="p">
              يجيب عن أسئلتك حول العقارات المعروضة. تأكد من التفاصيل في صفحة العقار.
            </Typography>
          </Box>
          {onClose && (
            <IconButton onClick={onClose} aria-label="إغلاق المحادثة" edge="end">
              <CloseOutlined />
            </IconButton>
          )}
        </Box>
      )}

      <Box
        role="log"
        aria-labelledby={showHeader ? titleId : undefined}
        aria-label={showHeader ? undefined : "المحادثة"}
        aria-live="polite"
        aria-busy={loading || undefined}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 2,
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ my: "auto", textAlign: "center", px: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              كيف أساعدك؟
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              اكتب ما تبحث عنه: نوع العقار والمدينة والسعر.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1 }}>
              {SUGGESTIONS.map((s) => (
                <Chip key={s} label={s} variant="outlined" onClick={() => ask(s)} disabled={loading} />
              ))}
            </Box>
          </Box>
        )}

        {messages.map((msg) => (
          <Bubble key={msg.id} author={msg.role}>
            {msg.text}
          </Bubble>
        ))}

        {loading && (
          <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <CircularProgress size={16} color="inherit" aria-hidden />
            <Typography variant="body2">يكتب المساعد ردّه…</Typography>
          </Box>
        )}

        {failed && !loading && (
          <Box
            role="alert"
            sx={{
              alignSelf: "flex-start",
              maxWidth: "85%",
              border: 1,
              borderColor: "color-mix(in srgb, var(--c-error) 40%, var(--c-border))",
              borderRadius: "var(--r-inner)",
              px: 1.5,
              py: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: "error.main" }}>
              {failed.message}
            </Typography>
            <Button size="small" onClick={() => ask(failed.question, { retry: true })} sx={{ mt: 0.5 }}>
              أعد إرسال السؤال
            </Button>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>

      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{ display: "flex", alignItems: "flex-end", gap: 1, p: 2, borderTop: 1, borderColor: "divider" }}
      >
        <TextField
          label="سؤالك"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter adds a line; Enter that confirms an IME composition does nothing.
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              ask(input);
            }
          }}
          multiline
          maxRows={4}
          fullWidth
          autoFocus={autoFocus}
          helperText={input.length > MAX_QUESTION - 50 ? `${input.length} / ${MAX_QUESTION}` : undefined}
          slotProps={{ htmlInput: { maxLength: MAX_QUESTION } }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={loading || !input.trim()}
          aria-label="إرسال السؤال"
          // v2: a 48px filled circle, level with the 48px field; quiet on the field colour while disabled.
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": { bgcolor: "var(--c-field)", color: "var(--c-muted)" },
            mb: input.length > MAX_QUESTION - 50 ? 3.5 : 0,
          }}
        >
          {/* The Outlined send glyph points right; flip it to point along the reading direction. */}
          <SendOutlined sx={{ transform: "scaleX(-1)" }} />
        </IconButton>
      </Box>
    </Box>
  );
}

function Bubble({ author, children }: { author: Message["role"]; children: React.ReactNode }) {
  const mine = author === "user";
  return (
    <Box
      sx={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: "85%",
        px: 1.5,
        py: 1,
        borderRadius: "var(--r-inner)",
        border: 1,
        borderColor: mine ? "transparent" : "divider",
        bgcolor: mine ? "var(--c-primary-soft)" : "var(--c-surface-2)",
        color: "text.primary",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        typography: "body1",
      }}
    >
      <Box component="span" sx={visuallyHidden}>
        {mine ? "أنت: " : "المساعد: "}
      </Box>
      {children}
    </Box>
  );
}

/** The floating chatbot button and its dialog (DESIGN-SYSTEM.md, Shells). Hidden on pages it would cover. */
export default function ChatbotButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <>
      {/* Floating button at the bottom inline-start corner: the physical right in Arabic (owner, 2026-10-07). */}
      <Tooltip title="اسأل مساعد سكنلي" placement="top">
        <Fab
          color="primary"
          size="small"
          onClick={() => setOpen(true)}
          aria-label="افتح مساعد سكنلي"
          aria-haspopup="dialog"
          sx={{ position: "fixed", bottom: 16, insetInlineStart: 16, zIndex: "fab", boxShadow: 2 }}
        >
          <SmartToyOutlined fontSize="small" />
        </Fab>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreen}
        aria-label="مساعد سكنلي"
        slotProps={{ paper: { sx: { height: { xs: "100%", sm: "min(640px, 85vh)" } } } }}
      >
        <ChatConversation onClose={() => setOpen(false)} autoFocus />
      </Dialog>
    </>
  );
}
