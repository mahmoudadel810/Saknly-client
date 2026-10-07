import type { Metadata } from "next";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ContentPage, { ContentSection } from "@/shared/ui/ContentPage";
import { CITY_OPTIONS } from "@/shared/constants/property";
import PropertyCount from "./PropertyCount";

export const metadata: Metadata = {
  title: "عن سكنلي",
  description: "سكنلي منصة لعرض العقارات للبيع والإيجار وسكن الطلاب، وكل إعلان يُراجع قبل نشره.",
};

export default function AboutPage() {
  return (
    <ContentPage
      title="عن سكنلي"
      description="منصة تجمع عقارات البيع والإيجار وسكن الطلاب في مكان واحد، وتوصلك بصاحب العقار مباشرة."
    >
      <ContentSection id="about-what" title="ما هو سكنلي؟">
        <p>
          سكنلي موقع لعرض العقارات والبحث فيها: شقق وفيلات ومحلات واستوديوهات ودوبلكس، للبيع أو للإيجار، وسكن
          مخصص للطلاب قرب الجامعات.
        </p>
        <p>نعرض حاليًا عقارات في: {CITY_OPTIONS.join("، ")}.</p>
        <PropertyCount />
      </ContentSection>

      <ContentSection id="about-how" title="كيف يعمل؟">
        <p>
          تصفّح العقارات وابحث فيها دون حساب. حين تجد ما يناسبك، تواصل مع صاحب الإعلان مباشرة عبر بيانات التواصل
          المكتوبة في صفحة العقار.
        </p>
        <p>
          لتنشر عقارك، أنشئ حسابًا ثم املأ نموذج «أضف عقارك». يراجع فريق سكنلي كل إعلان قبل نشره، ويظهر الإعلان في
          نتائج البحث بعد قبوله.
        </p>
      </ContentSection>

      <ContentSection id="about-goal" title="هدفنا">
        <p>
          أن يكون البحث عن سكن أسهل وأوضح: معلومات كاملة عن كل عقار، وصور حقيقية، وسعر واضح، وطريقة مباشرة للتواصل مع
          صاحبه.
        </p>
      </ContentSection>

      <Box sx={{ mt: 5, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        <Button component={Link} href="/properties" variant="contained">
          تصفّح العقارات
        </Button>
        <Button component={Link} href="/contact" variant="outlined">
          تواصل معنا
        </Button>
      </Box>
    </ContentPage>
  );
}
