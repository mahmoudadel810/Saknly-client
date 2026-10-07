// Property enums shared by the forms, filters and the importer.
// Keep these identical to the server enums in server/Model/PropertyModel.js
// (CITIES_BY_GOVERNORATE, PROPERTY_TYPES, AMENITIES and the category discriminator).

// Egypt's 27 governorates and the cities/districts offered in each. A city name belongs to exactly one
// governorate, so the governorate can always be derived from the city.
export const CITIES_BY_GOVERNORATE = {
  'القاهرة': [
    'القاهرة الجديدة', 'مدينة نصر', 'المعادي', 'مصر الجديدة', 'العاصمة الإدارية الجديدة', 'مدينتي', 'الشروق',
    'الرحاب', 'المقطم', 'عين شمس', 'حلوان', 'الزمالك', 'وسط البلد', 'شبرا', 'المرج', 'بدر', '15 مايو',
  ],
  'الجيزة': [
    'مدينة 6 أكتوبر', 'الشيخ زايد', 'حدائق أكتوبر', 'الهرم', 'فيصل', 'الدقي', 'المهندسين', 'العجوزة',
    'إمبابة', 'الجيزة',
  ],
  'الإسكندرية': [
    'سموحة', 'سيدي بشر', 'ميامي', 'العجمي', 'رشدي', 'المنتزه', 'سيدي جابر', 'محرم بك', 'برج العرب',
    'وسط الإسكندرية',
  ],
  'القليوبية': ['بنها', 'العبور', 'شبرا الخيمة', 'قليوب', 'الخانكة'],
  'المنوفية': [
    'شبين الكوم', 'منوف', 'تلا',
    'اشمون', // without hamza (server alias)
    'أشمون', // with hamza
    'قويسنا', 'بركة السبع', 'الباجور', 'مدينة السادات', 'سرس الليان',
  ],
  'الغربية': ['طنطا', 'المحلة الكبرى', 'كفر الزيات', 'زفتى'],
  'الدقهلية': ['المنصورة', 'المنصورة الجديدة', 'طلخا', 'ميت غمر'],
  'الشرقية': ['الزقازيق', 'العاشر من رمضان', 'بلبيس'],
  'البحيرة': ['دمنهور'],
  'كفر الشيخ': ['كفر الشيخ'],
  'دمياط': ['دمياط', 'دمياط الجديدة'],
  'بورسعيد': ['بورسعيد'],
  'الإسماعيلية': ['الإسماعيلية'],
  'السويس': ['السويس'],
  'الفيوم': ['الفيوم'],
  'بني سويف': ['بني سويف'],
  'المنيا': ['المنيا'],
  'أسيوط': ['أسيوط'],
  'سوهاج': ['سوهاج'],
  'قنا': ['قنا'],
  'الأقصر': ['الأقصر'],
  'أسوان': ['أسوان'],
  'البحر الأحمر': ['الغردقة'],
  'الوادي الجديد': ['الخارجة'],
  'مطروح': ['مرسى مطروح', 'العلمين الجديدة'],
  'شمال سيناء': ['العريش'],
  'جنوب سيناء': ['شرم الشيخ'],
} as const satisfies Record<string, readonly string[]>;

export type Governorate = keyof typeof CITIES_BY_GOVERNORATE;
export const GOVERNORATES = Object.keys(CITIES_BY_GOVERNORATE) as Governorate[];

/** Governorates with more than one city listed: shown first in filters, the rest behind "more". */
export const MAIN_GOVERNORATES = GOVERNORATES.filter((g) => CITIES_BY_GOVERNORATE[g].length > 1);

export const CITIES = GOVERNORATES.flatMap((g) => CITIES_BY_GOVERNORATE[g]);

export type City = (typeof CITIES)[number];

// The hamza-less 'اشمون' alias is accepted by the server but shown only once, as 'أشمون'.
const shown = (city: string) => city !== 'اشمون';

// Cities offered in dropdowns and filters.
export const CITY_OPTIONS: readonly City[] = CITIES.filter(shown);

/** The cities of the given governorates (all cities when none is given), in list order. */
export const citiesFor = (governorates: readonly string[]): City[] =>
  (governorates.length ? GOVERNORATES.filter((g) => governorates.includes(g)) : GOVERNORATES)
    .flatMap((g) => CITIES_BY_GOVERNORATE[g] as readonly City[])
    .filter(shown);

const GOVERNORATE_OF: Record<string, Governorate> = Object.fromEntries(
  GOVERNORATES.flatMap((g) => CITIES_BY_GOVERNORATE[g].map((city) => [city, g])),
);

export const governorateOf = (city: string | undefined | null): Governorate | null =>
  (city && GOVERNORATE_OF[city]) || null;

// Known spellings that are not in the server enum, mapped to the enum value.
export const CITY_ALIASES: Record<string, City> = {
  'السادات': 'مدينة السادات',
  'مدينه السادات': 'مدينة السادات',
  'التجمع الخامس': 'القاهرة الجديدة',
  'التجمع': 'القاهرة الجديدة',
  'القاهره الجديده': 'القاهرة الجديدة',
  'مدينه نصر': 'مدينة نصر',
  'مصر الجديده': 'مصر الجديدة',
  'العاصمة الإدارية': 'العاصمة الإدارية الجديدة',
  'العاصمه الاداريه': 'العاصمة الإدارية الجديدة',
  '6 أكتوبر': 'مدينة 6 أكتوبر',
  '6 اكتوبر': 'مدينة 6 أكتوبر',
  'السادس من أكتوبر': 'مدينة 6 أكتوبر',
  'اكتوبر': 'مدينة 6 أكتوبر',
  'أكتوبر': 'مدينة 6 أكتوبر',
  'زايد': 'الشيخ زايد',
  'المحله الكبرى': 'المحلة الكبرى',
  'المحلة': 'المحلة الكبرى',
  'العاشر': 'العاشر من رمضان',
};

export const GOVERNORATE_ALIASES: Record<string, Governorate> = {
  'القاهره': 'القاهرة',
  'الجيزه': 'الجيزة',
  'الاسكندرية': 'الإسكندرية',
  'اسكندرية': 'الإسكندرية',
  'الاسكندريه': 'الإسكندرية',
  'القليوبيه': 'القليوبية',
  'المنوفيه': 'المنوفية',
  'الغربيه': 'الغربية',
  'الدقهليه': 'الدقهلية',
  'الشرقيه': 'الشرقية',
  'البحيره': 'البحيرة',
  'الاسماعيلية': 'الإسماعيلية',
  'اسيوط': 'أسيوط',
  'الاقصر': 'الأقصر',
  'اسوان': 'أسوان',
};

export const normalizeCity = (input: string | undefined | null): City | null => {
  const value = (input || '').trim();
  if (!value) return null;
  if ((CITIES as readonly string[]).includes(value)) return value as City;
  if (CITY_ALIASES[value]) return CITY_ALIASES[value];
  return null;
};

export const normalizeGovernorate = (input: string | undefined | null): Governorate | null => {
  const value = (input || '').trim();
  if (!value) return null;
  if ((GOVERNORATES as readonly string[]).includes(value)) return value as Governorate;
  return GOVERNORATE_ALIASES[value] ?? null;
};

/** Map centre per governorate (its capital), for maps with nothing pinned yet. */
export const GOVERNORATE_CENTERS: Partial<Record<Governorate, [number, number]>> = {
  'القاهرة': [30.0444, 31.2357],
  'الجيزة': [30.0131, 31.2089],
  'الإسكندرية': [31.2001, 29.9187],
  'القليوبية': [30.4659, 31.1848],
  'المنوفية': [30.5546, 31.0117],
  'الغربية': [30.7865, 31.0004],
  'الدقهلية': [31.0409, 31.3785],
  'الشرقية': [30.5877, 31.502],
};

/** Egypt's populated core (Cairo and the Delta), used when a map has no listing and no governorate. */
export const EGYPT_CENTER: [number, number] = [30.6, 31.0];

export const PROPERTY_TYPE_VALUES = ['شقة', 'فيلا', 'محل', 'استوديو', 'دوبلكس'] as const;

export const PROPERTY_TYPE_OPTIONS = PROPERTY_TYPE_VALUES.map((value) => ({ value, label: value }));

export const AMENITIES = [
  'تكييف',
  'مصعد',
  'شرفة',
  'موقف سيارات',
  'مسموح بالحيوانات الأليفة',
  'مفروشة جزئياً',
  'أمن',
  'نظام كهرباء ذكي',
  'مطبخ مجهز',
  'مخزن',
] as const;

export const PROPERTY_CATEGORIES = ['sale', 'rent', 'student'] as const;
export type PropertyCategoryValue = (typeof PROPERTY_CATEGORIES)[number];
