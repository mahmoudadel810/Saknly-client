# Unit Testing with Vitest

هذا المجلد يحتوي على اختبارات الوحدة للصفحة الرئيسية باستخدام Vitest.

## هيكل الاختبارات

```
src/test/
├── setup.ts                    # إعداد الاختبارات
├── Home.test.tsx              # اختبار الصفحة الرئيسية
├── components/
│   ├── HeroSection.test.tsx   # اختبار قسم البطل
│   ├── FeaturedProperties.test.tsx # اختبار العقارات المميزة
│   └── HeroSearchBar.test.tsx # اختبار شريط البحث
└── README.md                  # هذا الملف
```

## كيفية تشغيل الاختبارات

### تشغيل جميع الاختبارات
```bash
npm test
```

### تشغيل الاختبارات مع واجهة المستخدم
```bash
npm run test:ui
```

### تشغيل الاختبارات مرة واحدة
```bash
npm run test:run
```

### تشغيل اختبارات محددة
```bash
npm test Home.test.tsx
```

## أنواع الاختبارات

### 1. اختبار الصفحة الرئيسية (Home.test.tsx)
- يختبر أن الصفحة الرئيسية تُعرض بدون أخطاء
- يتحقق من وجود جميع الأقسام الرئيسية
- يتحقق من ترتيب الأقسام

### 2. اختبار قسم البطل (HeroSection.test.tsx)
- يختبر عرض العنوان الرئيسي والعنوان الفرعي
- يتحقق من وجود شريط البحث
- يختبر التنسيق والتصميم

### 3. اختبار العقارات المميزة (FeaturedProperties.test.tsx)
- يختبر عرض العقارات من API
- يختبر حالات التحميل والأخطاء
- يختبر تغيير التبويبات
- يختبر استدعاءات API المختلفة

### 4. اختبار شريط البحث (HeroSearchBar.test.tsx)
- يختبر عرض جميع عناصر التحكم
- يختبر التفاعل مع النماذج
- يختبر التنقل مع المعاملات الصحيحة
- يختبر فتح النوافذ المنبثقة

## الميزات المختبرة

### ✅ اختبارات الوحدة
- [x] عرض المكونات
- [x] التفاعل مع النماذج
- [x] استدعاءات API
- [x] التنقل
- [x] حالات التحميل والأخطاء

### ✅ Mocking
- [x] Next.js Router
- [x] Axios
- [x] MUI Components
- [x] Environment Variables

### ✅ Testing Utilities
- [x] React Testing Library
- [x] Vitest
- [x] Jest DOM Matchers
- [x] User Event Simulation

## إضافة اختبارات جديدة

لإضافة اختبار جديد:

1. أنشئ ملف `.test.tsx` في المجلد المناسب
2. استورد المكون المراد اختباره
3. اكتب اختبارات باستخدام `describe` و `it`
4. استخدم `render` و `screen` من React Testing Library
5. استخدم `fireEvent` للتفاعل مع العناصر
6. استخدم `waitFor` للعمليات غير المتزامنة

### مثال:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## نصائح للاختبار

1. **اختر أسماء واضحة**: استخدم أسماء وصفية للاختبارات
2. **اختبر السلوك وليس التنفيذ**: ركز على ما يفعله المكون وليس كيف يفعل ذلك
3. **استخدم data-testid**: أضف `data-testid` للمكونات المهمة
4. **اختبر الحالات الحدية**: اختبر حالات الأخطاء والتحميل
5. **حافظ على الاختبارات بسيطة**: كل اختبار يجب أن يختبر شيئاً واحداً فقط 