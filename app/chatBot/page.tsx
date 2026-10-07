import type { Metadata } from "next";
import Box from "@mui/material/Box";
import PageHeader from "@/shared/ui/PageHeader";
import { ChatConversation } from "@/components/ChatbotButton";

export const metadata: Metadata = {
  title: "مساعد سكنلي",
  description: "اسأل مساعد سكنلي عن العقارات المعروضة للبيع والإيجار والسكن الطلابي.",
};

/** A full-page conversation with the same assistant as the floating button (which is hidden here). */
export default function ChatBotPage() {
  return (
    <Box component="main" id="main" sx={{ maxWidth: 840, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
      <PageHeader
        title="مساعد سكنلي"
        description="اسأل عن العقارات المعروضة على سكنلي بلغتك: نوع العقار والمدينة والسعر. المساعد قد يخطئ، فراجع التفاصيل في صفحة العقار."
      />
      <Box
        sx={{
          height: { xs: "calc(100dvh - 220px)", md: "min(680px, calc(100dvh - 240px))" },
          minHeight: 420,
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <ChatConversation showHeader={false} />
      </Box>
    </Box>
  );
}
