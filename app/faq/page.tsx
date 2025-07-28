"use client";

import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";

const faqs = [
  {
    question: "كيف أضيف عقاري على سكنلي؟",
    answer:
      "يمكنك إضافة عقارك من خلال الذهاب إلى صفحة 'أضف عقارك' وتعبئة النموذج بالمعلومات المطلوبة عن العقار وبيانات التواصل الخاصة بك.",
  },
  {
    question: "هل يمكنني تعديل بيانات عقاري بعد نشره؟",
    answer:
      "نعم، يمكنك تعديل بيانات عقارك من خلال لوحة التحكم الخاصة بك بعد تسجيل الدخول، ثم اختيار العقار وتحديث المعلومات المطلوبة.",
  },
  {
    question: "هل يتم التحقق من الإعلانات على سكنلي؟",
    answer:
      "نعم، نحن نحرص على أن تكون جميع الإعلانات دقيقة وحقيقية. يقوم فريقنا بعملية تحقق لكل عقار قبل نشره.",
  },
  {
    question: "كيف أتواصل مع المعلن عن عقار معين؟",
    answer:
      "في صفحة تفاصيل كل عقار ستجد نموذج تواصل مباشر مع المعلن، ويمكنك أيضًا إيجاد رقم الهاتف إذا كان متوفراً.",
  },
  {
    question: "هل هناك رسوم على استخدام منصة سكنلي؟",
    answer:
      "تصفح والبحث عن العقارات مجاني تمامًا للمشترين والمستأجرين. أما للمعلنين والوكلاء العقاريين، هناك خيارات إعلانات مميزة برسوم إضافية.",
  },
  {
    question: "كيف أستعيد كلمة المرور إذا نسيتها؟",
    answer:
      "يمكنك الضغط على 'نسيت كلمة المرور' في صفحة تسجيل الدخول واتباع التعليمات لإعادة تعيين كلمة المرور عبر بريدك الإلكتروني.",
  },
  {
    question: "هل بياناتي الشخصية آمنة على المنصة؟",
    answer:
      "نعم، نحن ملتزمون بحماية بياناتك الشخصية ونستخدم أحدث تقنيات الأمان للحفاظ عليها.",
  },
  {
    question: "كم يستغرق نشر الإعلان بعد إرساله؟",
    answer:
      "عادةً يتم مراجعة الإعلان ونشره خلال 24 ساعة من إرساله، وقد يختلف الوقت حسب ضغط العمل.",
  },
];

export default function FAQPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <Container
      maxWidth="md"
      sx={{ 
        py: { xs: 2, sm: 4, md: 6 }, 
        px: { xs: 2, sm: 3 },
        bgcolor: "#FFF", 
        minHeight: "100vh", 
        direction: "rtl" 
      }}
      dir="rtl"
    >
      <Box
        sx={{
          background: "#fff",
          borderRadius: 4,
          border: "1.5px solid #f0f0f0",
          boxShadow: "0 4px 24px 0 rgba(12, 148, 136, 0.07)",
          p: { xs: 2, sm: 3, md: 4, lg: 6 },
          mb: { xs: 3, md: 4 },
          mt: { xs: 1, md: 4 },
        }}
      >
        <Typography
          variant="h4"
          align="center"
          fontWeight={600}
          gutterBottom
          sx={{ 
            color: "#0284c7", 
            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            mb: { xs: 1, md: 2 }
          }}
        >
          الأسئلة الشائعة
        </Typography>
        <Typography
          align="center"
          color="text.secondary"
          sx={{ 
            mb: { xs: 2, md: 3 }, 
            fontSize: { xs: "0.875rem", sm: "1rem" } 
          }}
        >
          لديك سؤال؟ نحن هنا لمساعدتك.
        </Typography>
        
        {faqs.map((faq, idx) => (
          <Accordion
            key={idx}
            sx={{
              mb: 2,
              boxShadow: "none",
              border: "1px solid #eee",
              borderRadius: 2,
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#0284c7" }} />}
              sx={{ 
                minHeight: { xs: 48, md: 56 },
                '& .MuiAccordionSummary-content': {
                  my: 1,
                },
              }}
            >
              <Typography
                fontWeight={600}
                sx={{ 
                  color: "#0284c7", 
                  fontSize: { xs: "0.9375rem", sm: "1rem", md: "1.125rem" } 
                }}
              >
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails 
              sx={{ 
                bgcolor: "#f9f9f9", 
                borderRadius: 2,
                p: { xs: 2, md: 3 },
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
                  lineHeight: 1.6
                }}
              >
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          mt: { xs: 2, md: 3 },
          mb: { xs: 2, md: 0 }
        }}
      >
        <Link href="/" passHref>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#0284c7",
              color: "#0284c7",
              fontWeight: 600,
              px: { xs: 3, md: 4 },
              py: { xs: 0.75, md: 1 },
              borderRadius: 2,
              fontSize: { xs: "0.875rem", md: "1rem" },
              minWidth: { xs: 120, md: 140 },
              "&:hover": {
                background: "#0284c7",
                color: "#fff",
                borderColor: "#0284c7",
              },
            }}
          >
            العودة للرئيسية
          </Button>
        </Link>
      </Box>
    </Container>
  );
}