"use client";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Fab,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  CircularProgress
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";

export default function ChatbotButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "أهلاً! كيف يمكنني مساعدتك؟" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://saknly-server-9air.vercel.app/api/saknly/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text })
      });

      const data = await res.json();
      const botMsg = { role: "bot", text: data.answer };
      setMessages((prev) => [...prev, botMsg]);
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
      {/* الزر العائم */}
      <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1300, textAlign: "center" }}>
        <Typography variant="caption" color="primary">هل تحتاج لمساعدة!</Typography>
        <Fab color="primary" onClick={() => setOpen(true)}>
          <SmartToyIcon />
        </Fab>
      </Box>

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
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <IconButton color="primary" onClick={sendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
