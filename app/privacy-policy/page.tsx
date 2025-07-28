"use client";

import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Divider,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 2, md: 6 }, bgcolor: "#FFF", minHeight: "100vh", direction: "rtl" }}
      dir="rtl"
    >
      <Box
        sx={{
          background: "#fff",
          borderRadius: 4,
          border: "1.5px solid #f0f0f0",
          boxShadow: "0 4px 24px 0 rgba(12, 148, 136, 0.07)",
          p: { xs: 2, md: 6 },
          mb: 6,
          mt: 4,
        }}
      >
        <Typography
          variant="h3"
          align="center"
          fontWeight={600}
          gutterBottom
          sx={{ color: "#0284c7", fontSize: { xs: 32, md: 44 } }}
        >
          سياسة الخصوصية
        </Typography>
        <Typography
          align="center"
          color="text.secondary"
          sx={{ mb: 4, fontSize: { xs: 14, md: 18 } }}
        >
          آخر تحديث: 14 يونيو 2025
        </Typography>
        <Divider sx={{ mb: 4, bgcolor: "#e0e0e0" }} />
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 1, color: "#0284c7", fontSize: { xs: 18, md: 22 } }}
        >
          ١. المقدمة
        </Typography>
        <Typography sx={{ mb: 3, fontSize: { xs: 15, md: 17 } }}>
          مرحبًا بك في سكنلي. نحن ملتزمون بحماية خصوصيتك. توضح هذه السياسة كيف نجمع ونستخدم ونفصح عن معلوماتك عند زيارتك لموقعنا. يرجى قراءة هذه السياسة بعناية، وإذا لم توافق على الشروط، يرجى عدم استخدام الموقع.
        </Typography>
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 1, color: "#0284c7", fontSize: { xs: 18, md: 22 } }}
        >
          ٢. المعلومات التي نجمعها
        </Typography>
        <Typography sx={{ mb: 1, fontSize: { xs: 15, md: 17 } }}>
          قد نقوم بجمع معلومات عنك بعدة طرق. تشمل المعلومات التي قد نجمعها عبر الموقع:
        </Typography>
        <ul style={{ marginLeft: 24, marginBottom: 20, fontSize: 16, direction: "rtl", textAlign: "right" }}>
          <li style={{ marginBottom: 8 }}>
            <b>البيانات الشخصية:</b> معلومات تعريفية مثل الاسم، عنوان البريد الإلكتروني، رقم الهاتف، والعنوان، بالإضافة إلى معلومات ديموغرافية مثل العمر والجنس والاهتمامات، والتي تقدمها لنا طوعًا عند التسجيل أو المشاركة في أنشطة الموقع.
          </li>
          <li>
            <b>بيانات مشتقة:</b> معلومات يتم جمعها تلقائيًا عند استخدامك للموقع مثل عنوان الـ IP، نوع المتصفح، نظام التشغيل، أوقات الدخول، والصفحات التي قمت بزيارتها قبل وبعد استخدام الموقع.
          </li>
        </ul>
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 1, color: "#0284c7", fontSize: { xs: 18, md: 22 } }}
        >
          ٣. استخدام المعلومات
        </Typography>
        <Typography sx={{ mb: 3, fontSize: { xs: 15, md: 17 } }}>
          تساعدنا دقة المعلومات التي تقدمها في تقديم تجربة أفضل وأكثر تخصيصًا لك. نستخدم المعلومات لإدارة حسابك، التواصل معك بشأن الحساب أو الطلبات، تمكين التواصل بين المستخدمين، والرد على استفسارات الدعم الفني.
        </Typography>
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 1, color: "#0284c7", fontSize: { xs: 18, md: 22 } }}
        >
          ٤. أمان البيانات
        </Typography>
        <Typography sx={{ mb: 3, fontSize: { xs: 15, md: 17 } }}>
          نستخدم تدابير إدارية وتقنية وفيزيائية لحماية معلوماتك الشخصية. رغم جهودنا، لا توجد وسيلة نقل بيانات أو تخزين إلكتروني آمنة 100%، ولا يمكننا ضمان الحماية المطلقة للمعلومات.
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Link href="/">
          <Button
            variant="outlined"
            sx={{
              borderColor: "#0284c7",
              color: "#0284c7",
              fontWeight: 600,
              px: 4,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                background: "#0284c7",
                color: "#fff",
                borderColor: "#0284c7",
              },
            }}
          >
            Back to Home
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
