import type { Metadata } from "next";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ContentPage, { ContentSection } from "@/shared/ui/ContentPage";
import { CONTACT_INFO } from "@/shared/constants";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "ما البيانات التي يجمعها سكنلي، وكيف يستخدمها، ومن يراها.",
};

// Written from what the code does (server/modules, server/services). Update it when data handling changes.
export default function PrivacyPolicyPage() {
  return (
    <ContentPage
      title="سياسة الخصوصية"
      description={
        <>
          آخر تحديث: <span className="num">7</span> أكتوبر <span className="num">2026</span>
        </>
      }
    >
      <ContentSection id="privacy-collect" title="البيانات التي نجمعها">
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>
            <strong>بيانات حسابك:</strong> اسم المستخدم والبريد الإلكتروني ورقم الهاتف والعنوان. نحفظ كلمة المرور بصيغة
            مشفّرة لا يمكن قراءتها. إذا سجّلت الدخول بحساب Google نحصل منه على اسمك وبريدك الإلكتروني.
          </li>
          <li>
            <strong>بيانات إعلاناتك:</strong> تفاصيل العقار وصوره وموقعه على الخريطة وبيانات التواصل التي تكتبها في
            الإعلان.
          </li>
          <li>
            <strong>ما ترسله إلينا:</strong> رسائل «تواصل معنا»، وتعليقاتك على العقارات، وأسئلتك لمساعد سكنلي.
          </li>
          <li>
            <strong>بيانات تقنية:</strong> عنوان IP ونوع المتصفح في سجلات الخادم. ويحفظ متصفحك رمز تسجيل الدخول ووضع
            العرض (فاتح أو داكن).
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="privacy-use" title="كيف نستخدمها">
        <p>
          نستخدم بياناتك لتشغيل حسابك، وعرض إعلاناتك ومراجعتها قبل النشر، والرد على رسائلك، وإرسال رسائل الحساب إلى
          بريدك: تأكيد البريد، ورمز استعادة كلمة المرور، وقرار مراجعة إعلانك.
        </p>
      </ContentSection>

      <ContentSection id="privacy-public" title="ما يراه الآخرون">
        <p>
          تفاصيل إعلانك المنشور، ومنها بيانات التواصل التي كتبتها فيه، يراها كل زوار الموقع. وتظهر تعليقاتك مع اسم
          المستخدم الخاص بك. لا نعرض بريدك أو هاتفك المسجّلين في الحساب.
        </p>
      </ContentSection>

      <ContentSection id="privacy-services" title="الخدمات التي نستعين بها">
        <p>
          نحفظ صور الإعلانات لدى خدمة Cloudinary، ونرسل رسائل البريد عبر مزوّد بريد إلكتروني، ونستضيف الموقع لدى Vercel.
          تُرسل أسئلتك لمساعد سكنلي إلى خدمة Gemini من Google لتوليد الإجابة، فلا تكتب فيها بيانات شخصية. ولا نبيع
          بياناتك لأي جهة.
        </p>
      </ContentSection>

      <ContentSection id="privacy-choices" title="حقوقك">
        <p>
          تستطيع حذف إعلاناتك من «حسابي». ولحذف حسابك أو تصحيح بياناته، راسلنا على{" "}
          <MuiLink href={`mailto:${CONTACT_INFO.EMAIL}`}>
            <span dir="ltr">{CONTACT_INFO.EMAIL}</span>
          </MuiLink>
          .
        </p>
      </ContentSection>

      <ContentSection id="privacy-security" title="حماية البيانات">
        <p>
          نتخذ احتياطات تقنية لحماية بياناتك، مثل تشفير كلمات المرور واستخدام اتصال آمن. ومع ذلك لا توجد طريقة نقل أو
          تخزين آمنة تمامًا.
        </p>
      </ContentSection>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 5 }}>
        لأي سؤال عن هذه السياسة اتصل بنا على{" "}
        <MuiLink href={`tel:${CONTACT_INFO.PHONE_E164}`}>
          <span dir="ltr" className="num">
            {CONTACT_INFO.PHONE_DISPLAY}
          </span>
        </MuiLink>
        .
      </Typography>
    </ContentPage>
  );
}
