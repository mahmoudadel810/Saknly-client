"use client";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  CircularProgress,
  Tooltip
} from "@mui/material";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import SendIcon from "@mui/icons-material/Send";
import { API_URL } from "@/shared/services/api";

export default function ChatbotButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "أهلاً! كيف يمكنني مساعدتك؟" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    // One question at a time: the answer to the previous one is still on its way.
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text })
      });

      const data = await res.json().catch(() => ({}));
      const text = res.ok && data.answer
        ? data.answer
        : data.message || data.error || "حدث خطأ، حاول مرة أخرى";
      setMessages((prev) => [...prev, { role: "bot", text }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: "حدث خطأ، حاول مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <>
      {/* Floating button at the bottom inline-end corner; toasts use the bottom-start corner. */}
      <Tooltip title="اسأل مساعد سكنلي" placement="top">
        <Fab
          color="primary"
          size="small"
          onClick={() => setOpen(true)}
          aria-label="فتح مساعد سكنلي الذكي"
          aria-haspopup="dialog"
          sx={{ position: "fixed", bottom: 16, insetInlineEnd: 16, zIndex: "fab" }}
        >
          <SmartToyOutlined fontSize="small" />
        </Fab>
      </Tooltip>

      {/* نافذة الشات */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>مساعد سكنلي الذكي</DialogTitle>
        <DialogContent dividers sx={{ height: "400px", display: "flex", flexDirection: "column" }}>
          <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    bgcolor: msg.role === "user" ? "primary.main" : "grey.300",
                    color: msg.role === "user" ? "white" : "black",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "75%",
                    whiteSpace: "pre-wrap",
                     fontFamily: "inherit"
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: "grey.300",
                    color: "black",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <CircularProgress size={16} thickness={5} color="inherit" /> جاري التحميل...
                </Box>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              placeholder="اكتب سؤالك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              // isComposing: Enter that confirms an IME composition must not send.
              onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && sendMessage()}
            />
            <IconButton color="primary" onClick={sendMessage} disabled={loading || !input.trim()} aria-label="إرسال السؤال">
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
