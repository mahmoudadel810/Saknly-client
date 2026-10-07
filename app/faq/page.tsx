import type { Metadata } from "next";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ContentPage from "@/shared/ui/ContentPage";
import FaqAccordion, { type Faq } from "./FaqAccordion";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description: "إجابات عن نشر العقارات ومراجعتها، والتواصل مع أصحاب العقارات، وحسابك على سكنلي.",
};

// Every answer describes what the site does today. Do not promise features it lacks (editing, paid ads, SLAs).
const FAQS: Faq[] = [
  {
    question: "كيف أنشر عقاري على سكنلي؟",
    answer:
      "أنشئ حسابًا وأكّد بريدك الإلكتروني، ثم افتح «أضف عقارك» واملأ بيانات العقار وأضف صورة واحدة على الأقل (حتى 8 صور). بعد الإرسال يراجع فريق سكنلي الإعلان قبل نشره.",
  },
  {
    question: "متى يظهر إعلاني في نتائج البحث؟",
    answer:
      "بعد أن يراجعه فريق سكنلي ويقبله. تابع حالة إعلانك من «حسابي» ثم «إعلاناتي»: «قيد المراجعة» أو «مقبول». إذا رُفض الإعلان يُحذف ونبلغك بالبريد الإلكتروني.",
  },
  {
    question: "هل أستطيع تعديل إعلاني بعد نشره؟",
    answer:
      "تعديل الإعلان غير متاح من الموقع حاليًا. احذف الإعلان من «إعلاناتي» وانشره من جديد بالبيانات الصحيحة، أو راسلنا من صفحة «تواصل معنا».",
  },
  {
    question: "كيف أحذف إعلاني؟",
    answer: "من «حسابي» افتح «إعلاناتي»، واختر «حذف» بجانب الإعلان ثم أكّد الحذف. الحذف نهائي ويحذف صور الإعلان أيضًا.",
  },
  {
    question: "كيف أتواصل مع صاحب عقار؟",
    answer:
      "بيانات التواصل التي كتبها صاحب الإعلان موجودة في صفحة العقار: رقم الهاتف، وأحيانًا البريد الإلكتروني أو رقم واتساب. سكنلي لا يتوسط في الاتفاق أو الدفع.",
  },
  {
    question: "هل أحتاج إلى حساب لتصفّح العقارات؟",
    answer: "لا. التصفح والبحث متاحان للجميع دون حساب. تحتاج إلى حساب لحفظ العقارات في «المحفوظة» ولنشر إعلان.",
  },
  {
    question: "ما المقصود بسكن الطلاب؟",
    answer:
      "إعلانات مخصصة للطلاب، يوضح فيها صاحبها نوع الغرفة وعدد الطلاب في الغرفة والفئة المسموح بها والجامعات القريبة. اختر «سكن طلاب» في البحث لتظهر لك وحدها.",
  },
  {
    question: "نسيت كلمة المرور. ماذا أفعل؟",
    answer: "اضغط «نسيت كلمة المرور؟» في صفحة تسجيل الدخول واكتب بريدك. سنرسل إليك رمزًا تكتبه مع كلمة المرور الجديدة.",
  },
  {
    question: "لم تصلني رسالة تأكيد البريد الإلكتروني.",
    answer:
      "ابحث عنها في مجلد الرسائل غير المرغوب فيها. إن لم تجدها، حاول تسجيل الدخول وسيظهر لك زر «إعادة إرسال رابط التأكيد».",
  },
];

export default function FaqPage() {
  return (
    <ContentPage title="الأسئلة الشائعة" description="إجابات مختصرة عن البحث والنشر وحسابك على سكنلي.">
      <FaqAccordion items={FAQS} />
      <Box
        sx={{
          mt: 4,
          p: { xs: 2, md: 3 },
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
          bgcolor: "var(--c-surface-2)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <div>
          <Typography component="h2" variant="h6">
            لم تجد إجابتك؟
          </Typography>
          <Typography variant="body2" color="text.secondary">
            راسلنا وسنرد عليك بالبريد الإلكتروني.
          </Typography>
        </div>
        <Button component={Link} href="/contact" variant="outlined">
          تواصل معنا
        </Button>
      </Box>
    </ContentPage>
  );
}
